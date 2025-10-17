import { createClient } from '@supabase/supabase-js';
import { migrations } from './migrations';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class MigrationRunner {
    private async getCurrentVersion(): Promise<string> {
        try {
            // Check if migrations table exists
            const { data, error } = await supabase
                .from('migrations')
                .select('version')
                .order('version', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code === 'PGRST116') {
                // Table doesn't exist, create it
                await this.createMigrationsTable();
                return '000';
            }

            return data?.version || '000';
        } catch (error) {
            console.log('No migrations table found, starting fresh');
            await this.createMigrationsTable();
            return '000';
        }
    }

    private async createMigrationsTable() {
        const { error } = await supabase.rpc('exec_sql', {
            sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          version TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
        });
        if (error) throw error;
    }

    async runMigrations(): Promise<void> {
        console.log('🔄 Running database migrations...');

        const currentVersion = await this.getCurrentVersion();
        console.log(`📊 Current version: ${currentVersion}`);

        const pendingMigrations = migrations.filter(m => m.version > currentVersion);

        if (pendingMigrations.length === 0) {
            console.log('✅ Database is up to date!');
            return;
        }

        console.log(`📈 Found ${pendingMigrations.length} pending migrations`);

        for (const migration of pendingMigrations) {
            console.log(`🚀 Running migration ${migration.version}: ${migration.name}`);

            try {
                // Execute the migration
                const { error } = await supabase.rpc('exec_sql', {
                    sql: migration.up
                });

                if (error) throw error;

                // Record the migration
                await supabase
                    .from('migrations')
                    .insert({
                        version: migration.version,
                        name: migration.name
                    });

                console.log(`✅ Migration ${migration.version} completed`);

            } catch (error) {
                console.error(`❌ Migration ${migration.version} failed:`, error);
                throw error;
            }
        }

        console.log('🎉 All migrations completed successfully!');
    }

    async rollbackMigration(version: string): Promise<void> {
        console.log(`🔄 Rolling back migration ${version}...`);

        const migration = migrations.find(m => m.version === version);
        if (!migration) {
            throw new Error(`Migration ${version} not found`);
        }

        try {
            // Execute rollback
            const { error } = await supabase.rpc('exec_sql', {
                sql: migration.down
            });

            if (error) throw error;

            // Remove migration record
            await supabase
                .from('migrations')
                .delete()
                .eq('version', version);

            console.log(`✅ Rollback ${version} completed`);

        } catch (error) {
            console.error(`❌ Rollback ${version} failed:`, error);
            throw error;
        }
    }

    async getMigrationStatus(): Promise<any> {
        const currentVersion = await this.getCurrentVersion();
        const allMigrations = migrations.map(m => ({
            version: m.version,
            name: m.name,
            status: m.version <= currentVersion ? 'completed' : 'pending'
        }));

        return {
            currentVersion,
            migrations: allMigrations
        };
    }
}

export const migrationRunner = new MigrationRunner();
