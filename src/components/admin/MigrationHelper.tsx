import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Copy, 
  Download, 
  ExternalLink, 
  Github, 
  Database,
  Code,
  Settings,
  AlertCircle,
  Rocket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function MigrationHelper() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    projectId: '',
    anonKey: '',
    projectUrl: '',
    serviceRoleKey: '',
  });

  const currentConfig = {
    projectId: 'kzqcfrubjccxrwfkkrze',
    url: 'https://kzqcfrubjccxrwfkkrze.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6cWNmcnViamNjeHJ3ZmtrcnplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNjI4ODEsImV4cCI6MjA3NTYzODg4MX0.yCLjMC7QcM-RNHFxOdQb7O0C7yq0D9e3bP7kyrL0u3E',
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const generateEnvFile = () => {
    return `# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="${config.projectId}"
VITE_SUPABASE_PUBLISHABLE_KEY="${config.anonKey}"
VITE_SUPABASE_URL="${config.projectUrl}"

# Application Environment
NODE_ENV=development

# Optional: Feature Flags
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false

# Optional: API Configuration
VITE_API_TIMEOUT=30000

# Capacitor Platform
VITE_CAPACITOR_PLATFORM=web`;
  };

  const generateConfigToml = () => {
    return `project_id = "${config.projectId}"

[functions.badge-service-api]
verify_jwt = false

[functions.delete-user]
verify_jwt = true

[functions.generate-badge-image]
verify_jwt = true

[functions.seed-badges]
verify_jwt = true`;
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: `${filename} downloaded successfully`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Migration Helper</h2>
        <p className="text-muted-foreground">
          Migrate from Lovable Cloud to your own Supabase and GitHub
        </p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This tool helps you migrate to self-managed infrastructure. Your current Lovable Cloud setup will continue working until you fully switch over.
        </AlertDescription>
      </Alert>

      <Tabs value={`step-${step}`} onValueChange={(v) => setStep(Number(v.split('-')[1]))}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="step-1">1. Current</TabsTrigger>
          <TabsTrigger value="step-2">2. Supabase</TabsTrigger>
          <TabsTrigger value="step-3">3. Files</TabsTrigger>
          <TabsTrigger value="step-4">4. Deploy</TabsTrigger>
          <TabsTrigger value="step-5">5. GitHub</TabsTrigger>
        </TabsList>

        <TabsContent value="step-1" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Current Lovable Cloud Configuration
              </CardTitle>
              <CardDescription>
                Your project is currently connected to Lovable Cloud (powered by Supabase)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Project ID</Label>
                <div className="flex gap-2">
                  <Input value={currentConfig.projectId} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(currentConfig.projectId, 'Project ID')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Supabase URL</Label>
                <div className="flex gap-2">
                  <Input value={currentConfig.url} readOnly />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(currentConfig.url, 'URL')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Anon Key</Label>
                <div className="flex gap-2">
                  <Input 
                    value={currentConfig.anonKey.substring(0, 40) + '...'} 
                    readOnly 
                    type="password"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(currentConfig.anonKey, 'Anon Key')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert className="bg-blue-500/10 border-blue-500/50">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <AlertDescription>
                  <strong>What you have:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Database with all tables and RLS policies</li>
                    <li>4 deployed edge functions (badge-service-api, delete-user, generate-badge-image, seed-badges)</li>
                    <li>Storage bucket for badges</li>
                    <li>Authentication configured</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button onClick={() => setStep(2)} className="w-full">
                Continue to Supabase Setup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-2" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                New Supabase Project Configuration
              </CardTitle>
              <CardDescription>
                Create a new Supabase project and enter your credentials here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>First, create your Supabase project:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary underline">supabase.com/dashboard</a></li>
                      <li>Click "New Project"</li>
                      <li>Fill in project details and create</li>
                      <li>Go to Settings → API to get your credentials</li>
                    </ol>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="projectId">Project ID (Reference ID)</Label>
                <Input
                  id="projectId"
                  placeholder="abc123xyz456"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectUrl">Project URL</Label>
                <Input
                  id="projectUrl"
                  placeholder="https://abc123xyz456.supabase.co"
                  value={config.projectUrl}
                  onChange={(e) => setConfig({ ...config, projectUrl: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anonKey">Anon/Public Key</Label>
                <Input
                  id="anonKey"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.anonKey}
                  onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceRoleKey">Service Role Key (Optional)</Label>
                <Input
                  id="serviceRoleKey"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={config.serviceRoleKey}
                  onChange={(e) => setConfig({ ...config, serviceRoleKey: e.target.value })}
                  type="password"
                />
                <p className="text-xs text-muted-foreground">
                  Only needed for admin operations. Keep this secret!
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  disabled={!config.projectId || !config.projectUrl || !config.anonKey}
                >
                  Continue to Configuration Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-3" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Generate Configuration Files
              </CardTitle>
              <CardDescription>
                Download these files to replace your current configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">.env</p>
                    <p className="text-sm text-muted-foreground">
                      Environment variables for your application
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateEnvFile(), '.env contents')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(generateEnvFile(), '.env')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">supabase/config.toml</p>
                    <p className="text-sm text-muted-foreground">
                      Supabase project configuration
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generateConfigToml(), 'config.toml contents')}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(generateConfigToml(), 'config.toml')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              <Alert className="bg-amber-500/10 border-amber-500/50">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription>
                  <strong>Important:</strong> Do not commit these files with real credentials to public repositories. Add them to .gitignore.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Continue to Deployment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-4" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Deploy Database & Functions
              </CardTitle>
              <CardDescription>
                Run these commands in your terminal after cloning your GitHub repo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">1. Install Supabase CLI</h3>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <code>npm install -g supabase</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('npm install -g supabase', 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">2. Link to Your Project</h3>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <code>supabase link --project-ref {config.projectId || 'YOUR_PROJECT_ID'}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`supabase link --project-ref ${config.projectId}`, 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">3. Push Database Migrations</h3>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <code>supabase db push</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('supabase db push', 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This creates all your tables, RLS policies, functions, and triggers
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">4. Deploy Edge Functions</h3>
                  <div className="space-y-2">
                    {['badge-service-api', 'delete-user', 'generate-badge-image', 'seed-badges'].map((fn) => (
                      <div key={fn} className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                        <code>supabase functions deploy {fn}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(`supabase functions deploy ${fn}`, 'Command')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">5. Create Storage Bucket</h3>
                  <Alert>
                    <Database className="h-4 w-4" />
                    <AlertDescription>
                      Go to your Supabase dashboard → Storage → Create bucket named "badges" and make it public
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <h3 className="font-medium mb-2">6. Set Secrets (if needed)</h3>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <code>supabase secrets set LOVABLE_API_KEY=your_key</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('supabase secrets set LOVABLE_API_KEY=your_key', 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button onClick={() => setStep(5)} className="flex-1">
                  Continue to GitHub Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-5" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Setup & Deployment
              </CardTitle>
              <CardDescription>
                Connect your project to GitHub and deploy to production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">1. Connect GitHub from Lovable</h3>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Click GitHub button in top-right of Lovable</li>
                    <li>Authorize the Lovable GitHub App</li>
                    <li>Click "Create Repository" to push your code</li>
                    <li>Your code is now on GitHub!</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-medium mb-2">2. Clone and Setup Locally</h3>
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <code>git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git', 'Command')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                      <code>cd YOUR_REPO && npm install</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard('cd YOUR_REPO && npm install', 'Command')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">3. Test Locally</h3>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm flex items-center justify-between">
                    <code>npm run dev</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('npm run dev', 'Command')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Make sure authentication, database, and all features work correctly
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">4. Deploy to Production</h3>
                  <Alert>
                    <Rocket className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-2">Recommended: Deploy to Vercel</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">vercel.com</a></li>
                        <li>Import your GitHub repository</li>
                        <li>Set framework preset to "Vite"</li>
                        <li>Add environment variables from your .env file</li>
                        <li>Deploy!</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <h3 className="font-medium mb-2">5. Update Supabase Redirect URLs</h3>
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertDescription>
                      In your Supabase dashboard → Authentication → URL Configuration, add your production URL to redirect URLs
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <Alert className="bg-green-500/10 border-green-500/50">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  <strong>You're all set!</strong>
                  <p className="mt-2 text-sm">
                    Your application is now running on your own infrastructure. You have full control over your database, functions, and hosting.
                  </p>
                </AlertDescription>
              </Alert>

              <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                Back to Start
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
