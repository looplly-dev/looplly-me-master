import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { AuthLogsDashboard } from '@/components/admin/auth-logs/AuthLogsDashboard';
import { AuthLogsDataInjector } from '@/components/admin/auth-logs/AuthLogsDataInjector';
import { Shield } from 'lucide-react';

// Auth logs from Supabase
const AUTH_LOGS_DATA = [{"error":null,"event_message":"{\"auth_event\":{\"action\":\"login\",\"actor_id\":\"bcf0974b-80b3-4b4c-a329-b8fdf3eee4fc\",\"actor_username\":\"nadia@looplly.me\",\"actor_via_sso\":false,\"log_type\":\"account\",\"traits\":{\"provider\":\"email\"}},\"component\":\"api\",\"duration\":93177942,\"grant_type\":\"password\",\"level\":\"info\",\"method\":\"POST\",\"msg\":\"request completed\",\"path\":\"/token\",\"referer\":\"https://ca8b20a9-dc06-4304-8bd7-56d5885d43af.lovableproject.com/\",\"remote_addr\":\"146.70.194.91\",\"request_id\":\"99a39220b492d53c-CDG\",\"status\":200,\"time\":\"2025-11-06T09:30:12Z\"}","id":"43842590-0ad4-4bb9-980a-53f2104800aa","level":"info","msg":"request completed","path":"/token","status":"200","timestamp":1762421412000000},{"error":null,"event_message":"{\"action\":\"login\",\"instance_id\":\"00000000-0000-0000-0000-000000000000\",\"level\":\"info\",\"login_method\":\"password\",\"metering\":true,\"msg\":\"Login\",\"provider\":\"email\",\"time\":\"2025-11-06T09:30:12Z\",\"user_id\":\"bcf0974b-80b3-4b4c-a329-b8fdf3eee4fc\"}","id":"94577219-766d-4ce9-858f-8e46c0482085","level":"info","msg":"Login","path":null,"status":null,"timestamp":1762421412000000},{"error":null,"event_message":"{\"auth_event\":{\"action\":\"logout\",\"actor_id\":\"bcf0974b-80b3-4b4c-a329-b8fdf3eee4fc\",\"actor_username\":\"nadia@looplly.me\",\"actor_via_sso\":false,\"log_type\":\"account\"},\"component\":\"api\",\"duration\":6882385,\"level\":\"info\",\"method\":\"POST\",\"msg\":\"request completed\",\"path\":\"/logout\",\"referer\":\"https://ca8b20a9-dc06-4304-8bd7-56d5885d43af.lovableproject.com/\",\"remote_addr\":\"146.70.194.91\",\"request_id\":\"99a391ea9313d53c-CDG\",\"status\":204,\"time\":\"2025-11-06T09:30:03Z\"}","id":"84ad9d76-0ec1-44a2-82d0-473d9f9dc9a6","level":"info","msg":"request completed","path":"/logout","status":"204","timestamp":1762421403000000},{"error":null,"event_message":"{\"auth_event\":{\"action\":\"logout\",\"actor_id\":\"ccd53ae3-de71-4b20-a13f-56f63ac84fb5\",\"actor_username\":\"02feb2a9-c671-4320-85fa-a8641b9698af@looplly.mobile\",\"actor_via_sso\":false,\"log_type\":\"account\"},\"component\":\"api\",\"duration\":8796489,\"level\":\"info\",\"method\":\"POST\",\"msg\":\"request completed\",\"path\":\"/logout\",\"referer\":\"https://ca8b20a9-dc06-4304-8bd7-56d5885d43af.lovableproject.com/\",\"remote_addr\":\"146.70.194.91\",\"request_id\":\"99a391b422dfd53c-CDG\",\"status\":204,\"time\":\"2025-11-06T09:29:54Z\"}","id":"5b104dbd-9269-4511-93d8-648490732ca0","level":"info","msg":"request completed","path":"/logout","status":"204","timestamp":1762421394000000},{"error":null,"event_message":"{\"action\":\"login\",\"instance_id\":\"00000000-0000-0000-0000-000000000000\",\"level\":\"info\",\"login_method\":\"password\",\"metering\":true,\"msg\":\"Login\",\"provider\":\"email\",\"time\":\"2025-11-06T09:29:54Z\",\"user_id\":\"ccd53ae3-de71-4b20-a13f-56f63ac84fb5\"}","id":"3077b930-0751-47f0-b7fb-f0a0e33b880b","level":"info","msg":"Login","path":null,"status":null,"timestamp":1762421394000000},{"error":null,"event_message":"{\"auth_event\":{\"action\":\"login\",\"actor_id\":\"ccd53ae3-de71-4b20-a13f-56f63ac84fb5\",\"actor_username\":\"02feb2a9-c671-4320-85fa-a8641b9698af@looplly.mobile\",\"actor_via_sso\":false,\"log_type\":\"account\",\"traits\":{\"provider\":\"email\"}},\"component\":\"api\",\"duration\":106270147,\"grant_type\":\"password\",\"level\":\"info\",\"method\":\"POST\",\"msg\":\"request completed\",\"path\":\"/token\",\"referer\":\"https://ca8b20a9-dc06-4304-8bd7-56d5885d43af.lovableproject.com/\",\"remote_addr\":\"146.70.194.91\",\"request_id\":\"99a391b0926fd53c-CDG\",\"status\":200,\"time\":\"2025-11-06T09:29:54Z\"}","id":"d94b39ac-e07e-42d9-a360-aa73cc4bef8b","level":"info","msg":"request completed","path":"/token","status":"200","timestamp":1762421394000000}];

// Edge function logs (sample data for development)
const EDGE_FUNCTION_LOGS_DATA = [{"event_message":"[MOCK LOGIN] Login successful for: +27828543494\\n","event_type":"Log","function_id":"6539f5d4-159d-4e48-9840-547489162ba2","level":"info","timestamp":1762421393857000},{"event_message":"[MOCK LOGIN] Mapping upserted successfully\\n","event_type":"Log","function_id":"6539f5d4-159d-4e48-9840-547489162ba2","level":"info","timestamp":1762421393855000},{"event_message":"[MOCK LOGIN] Upserting mapping for looplly_user_id: 02feb2a9-c671-4320-85fa-a8641b9698af supabase_auth_id: ccd53ae3-de71-4b20-a13f-56f63ac84fb5\\n","event_type":"Log","function_id":"6539f5d4-159d-4e48-9840-547489162ba2","level":"info","timestamp":1762421393800000}];

function AdminAuthLogsContent() {
  return (
    <div className="space-y-6">
      <AuthLogsDataInjector 
        authLogs={AUTH_LOGS_DATA} 
        edgeFunctionLogs={EDGE_FUNCTION_LOGS_DATA}
      />
      
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Authentication Troubleshooting</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor and debug authentication events, sessions, and errors across all portals
        </p>
      </div>

      <AuthLogsDashboard />
    </div>
  );
}

export default function AdminAuthLogs() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminLayout>
        <AdminAuthLogsContent />
      </AdminLayout>
    </ProtectedRoute>
  );
}
