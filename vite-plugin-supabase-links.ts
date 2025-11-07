import type { Plugin } from 'vite';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function supabaseLinksPlugin(): Plugin {
  return {
    name: 'supabase-links',
    async configureServer(server) {
      server.httpServer?.once('listening', async () => {
        // Small delay to ensure server is fully ready
        setTimeout(async () => {
          try {
            // Check if Supabase is running
            const { stdout } = await execAsync('supabase status 2>&1');
            
            if (stdout.includes('Database URL:')) {
              console.log('\n');
              console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
              console.log('\x1b[1m\x1b[35m%s\x1b[0m', '  🗄️  Local Supabase Services');
              console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════');
              console.log('\x1b[32m%s\x1b[0m', '  📊 Studio:   http://127.0.0.1:54323');
              console.log('\x1b[32m%s\x1b[0m', '  🔌 API:      http://127.0.0.1:54321');
              console.log('\x1b[32m%s\x1b[0m', '  📧 Mailpit:  http://127.0.0.1:54324');
              console.log('\x1b[32m%s\x1b[0m', '  💾 Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres');
              console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════════\n');
            } else {
              console.log('\x1b[33m%s\x1b[0m', '⚠️  Supabase not running. Start with: supabase start\n');
            }
          } catch (error) {
            // Supabase CLI not available or not running - silently skip
          }
        }, 1000);
      });
    },
  };
}
