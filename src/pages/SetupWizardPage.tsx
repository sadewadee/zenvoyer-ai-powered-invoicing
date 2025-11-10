import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Building, User, Check } from 'lucide-react';
import { useClientStore } from '@/stores/use-client-store';
const businessSchema = z.object({
  companyName: z.string().min(2, 'Company name is required.'),
  address: z.string().min(10, 'Please enter a full address.'),
});
const clientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  address: z.string().min(5, "Address is too short."),
});
type BusinessFormValues = z.infer<typeof businessSchema>;
type ClientFormValues = z.infer<typeof clientSchema>;
const steps = [
  { id: 1, title: 'Business Profile', icon: Building, schema: businessSchema },
  { id: 2, title: 'First Client', icon: User, schema: clientSchema },
  { id: 3, title: 'All Set!', icon: Check },
];
export function SetupWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const addClient = useClientStore(state => state.addClient);
  const businessForm = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: { companyName: '', address: '' },
  });
  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { name: '', email: '', address: '' },
  });
  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await businessForm.trigger();
      if (isValid) {
        console.log('Business Profile Saved:', businessForm.getValues());
      }
    } else if (currentStep === 2) {
      isValid = await clientForm.trigger();
      if (isValid) {
        addClient({ ...clientForm.getValues(), phone: '' });
      }
    }
    if (isValid) {
      setCurrentStep(s => s + 1);
    }
  };
  const handleFinish = () => {
    navigate('/app/dashboard');
  };
  const progress = (currentStep / steps.length) * 100;
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-700 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-50">Welcome to Zenitho!</h1>
          <p className="text-muted-foreground mt-2">Let's get your account set up in just a few steps.</p>
        </div>
        <Progress value={progress} className="mb-8" />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> {steps[0].title}</CardTitle>
                  <CardDescription>Tell us about your business. This will appear on your invoices.</CardDescription>
                </CardHeader>
                <Form {...businessForm}>
                  <form>
                    <CardContent className="space-y-4">
                      <FormField control={businessForm.control} name="companyName" render={({ field }) => (
                        <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={businessForm.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Business Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </CardContent>
                    <CardFooter>
                      <Button onClick={handleNext} className="ml-auto">Next</Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> {steps[1].title}</CardTitle>
                  <CardDescription>Add your first client to get started with invoicing.</CardDescription>
                </CardHeader>
                <Form {...clientForm}>
                  <form>
                    <CardContent className="space-y-4">
                      <FormField control={clientForm.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Client Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={clientForm.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Client Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={clientForm.control} name="address" render={({ field }) => (
                        <FormItem><FormLabel>Client Address</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
                      <Button onClick={handleNext}>Next</Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            )}
            {currentStep === 3 && (
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto bg-zen-secondary-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <Check className="h-8 w-8 text-zen-secondary-600" />
                  </div>
                  <CardTitle className="mt-4">{steps[2].title}</CardTitle>
                  <CardDescription>You're all set up and ready to start invoicing.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button onClick={handleFinish} className="w-full">Go to Dashboard</Button>
                </CardFooter>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}