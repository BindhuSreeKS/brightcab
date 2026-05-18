package com.cabgo.service;

import com.cabgo.enums.ComplaintStatus;
import com.cabgo.enums.ComplaintType;
import com.cabgo.enums.AuditAction;
import com.cabgo.exception.ResourceNotFoundException;
import com.cabgo.model.Complaint;
import com.cabgo.repository.ComplaintRepository;
import com.cabgo.response.PagedResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;

    public PagedResponse<Complaint> getAllComplaints(String status, String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Complaint> complaints;
        if (status != null) {
            complaints = complaintRepository.findByStatus(ComplaintStatus.valueOf(status), pageable);
        } else if (type != null) {
            complaints = complaintRepository.findByType(ComplaintType.valueOf(type), pageable);
        } else {
            complaints = complaintRepository.findAll(pageable);
        }
        return build(complaints);
    }

    public Complaint getById(String id) {
        return complaintRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
    }

    public Complaint resolveComplaint(String id, String resolution, String adminId) {
        Complaint c = complaintRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Complaint", id));
        c.setStatus(ComplaintStatus.RESOLVED);
        c.setResolution(resolution);
        c.setResolvedBy(adminId);
        Complaint saved = complaintRepository.save(c);
        auditLogService.log(adminId, null, AuditAction.UPDATE, "COMPLAINT", id, "Complaint resolved");
        return saved;
    }

    public List<Complaint> getSosAlerts() {
        return complaintRepository.findByIsSOS(true);
    }

    public Map<String, Long> getComplaintStats() {
        return Map.of(
                "total", complaintRepository.count(),
                "open", complaintRepository.countByStatus(ComplaintStatus.OPEN),
                "resolved", complaintRepository.countByStatus(ComplaintStatus.RESOLVED),
                "sos", complaintRepository.countByIsSOS(true)
        );
    }

    private PagedResponse<Complaint> build(Page<Complaint> page) {
        return PagedResponse.<Complaint>builder()
                .content(page.getContent()).page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).first(page.isFirst()).build();
    }
}
