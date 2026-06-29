import React from 'react';
import { 
  ArrowLeft, Mail, Phone, MapPin, Calendar, 
  ShieldCheck, Car, CreditCard, Clock, 
  CheckCircle2, AlertCircle, FileText, Download,
  ExternalLink, ZoomIn, Star, Award
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Badge } from '../../../components/ui';
import { MOCK_APPLICATIONS } from './mockData';
import { cn } from '../../../lib/utils';
import { onboardingApi } from '../../../lib/api';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

export default function DriverProfileDetails() {
  const { id } = useParams<{ id: string }>();
  const [driver, setDriver] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (id) fetchDriverDetails();
  }, [id]);

  const fetchDriverDetails = async () => {
    try {
      setLoading(true);
      const res = await onboardingApi.getApplication(id!);
      setDriver(res.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch application details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string, reason?: string) => {
    try {
      await onboardingApi.updateStatus(id!, status, reason);
      toast.success(`Application ${status.toLowerCase()} successfully`);
      fetchDriverDetails();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Clock className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!driver) return <div className="p-8 text-center text-slate-500">Application not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Application Details</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 font-mono">ID: {driver.id}</span>
            <Badge variant="warning">{driver.verificationStatus.replace('_', ' ')}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="relative inline-block">
                <img src={driver.driverSelfieImage || driver.documents?.driverSelfie} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white dark:border-slate-800 shadow-2xl" alt="" />
                <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <h2 className="text-xl font-bold mt-4">{driver.name}</h2>
              <p className="text-sm text-slate-500 mb-6">{driver.city || 'India'}</p>
              
              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Onboarding</p>
                  <p className="text-sm font-bold">{driver.verificationProgress}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">Risk Level</p>
                  <p className={cn("text-sm font-bold", driver.riskScore > 70 ? "text-red-600" : "text-emerald-600")}>
                    {driver.riskScore > 70 ? 'High' : driver.riskScore > 30 ? 'Medium' : 'Low'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{driver.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  {driver.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  Applied on {new Date(driver.createdAt || driver.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Application Timeline
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {[
                  { title: 'Application Submitted', date: new Date(driver.createdAt).toLocaleString(), status: 'completed' },
                  { title: 'OTP Verification', date: 'Verified', status: 'completed' },
                  { title: 'Documents Uploaded', date: 'Done', status: 'completed' },
                  { title: 'Documents Under Review', date: driver.verificationStatus === 'UNDER_REVIEW' ? 'Current' : 'Done', status: driver.verificationStatus === 'UNDER_REVIEW' ? 'current' : 'completed' },
                  { title: 'Vehicle Inspection', date: 'Pending', status: 'upcoming' },
                  { title: 'Activation', date: 'Pending', status: 'upcoming' },
                ].map((step, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={cn(
                      "w-[34px] h-[34px] rounded-full flex items-center justify-center shrink-0 z-10",
                      step.status === 'completed' ? "bg-emerald-100 text-emerald-600" : 
                      step.status === 'current' ? "bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50" : "bg-slate-100 text-slate-400"
                    )}>
                      {step.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold", step.status === 'upcoming' ? "text-slate-400" : "text-slate-900 dark:text-white")}>{step.title}</p>
                      <p className="text-[10px] text-slate-500">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Car className="w-4 h-4 text-indigo-600" />
                  Vehicle Information
                </h3>
                <Badge variant="outline">{driver.vehicleCategory || driver.vehicleType}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Vehicle</p>
                    <p className="text-sm font-bold">{driver.vehicleBrand} {driver.vehicleModel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Registration</p>
                    <p className="text-sm font-bold">{driver.vehicleNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Color</p>
                    <p className="text-sm font-bold">{driver.vehicleColor}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Year</p>
                    <p className="text-sm font-bold">{driver.vehicleYear || driver.manufacturingYear}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Legal Credentials
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Driving License</p>
                        <p className="text-sm font-mono font-bold">{driver.licenseNumber}</p>
                      </div>
                    </div>
                    <Badge variant="success">Verified</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Aadhaar Number</p>
                        <p className="text-sm font-mono font-bold">{driver.aadhaarNumber}</p>
                      </div>
                    </div>
                    <Badge variant="success">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h3 className="font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Uploaded Documents
              </h3>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-3.5 h-3.5" />
                Download All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Aadhaar Front', url: driver.aadhaarFrontImage || driver.documents?.aadhaarFront },
                  { name: 'Aadhaar Back', url: driver.aadhaarBackImage || driver.documents?.aadhaarBack },
                  { name: 'Driving License', url: driver.licenseImage || driver.documents?.drivingLicense },
                  { name: 'RC Book', url: driver.rcBookImage || driver.documents?.rcBook },
                  { name: 'Vehicle Front', url: driver.vehicleFrontImage || driver.documents?.vehicleFront },
                  { name: 'Vehicle Rear', url: driver.vehicleBackImage || driver.documents?.vehicleBack },
                  { name: 'Insurance', url: driver.insuranceImage || driver.documents?.insurance },
                  { name: 'PAN Card', url: driver.panCardImage || driver.documents?.panCard },
                ].map((doc, i) => (
                  <div key={i} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={doc.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center">
                      <p className="text-[10px] font-bold text-white mb-2">{doc.name}</p>
                      <div className="flex gap-1">
                        <button className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30">
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button 
              variant="danger" 
              className="flex-1 py-4"
              onClick={() => {
                const reason = prompt('Enter rejection reason:');
                if (reason) handleUpdateStatus('REJECTED', reason);
              }}
            >
              Reject Application
            </Button>
            <Button 
              variant="primary" 
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleUpdateStatus('APPROVED')}
            >
              Approve & Move to Activation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
