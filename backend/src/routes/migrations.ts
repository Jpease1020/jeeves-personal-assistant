import { Router } from 'express';
import { migrationRunner } from '../migrations/runner';

const router = Router();

// Run all pending migrations
router.post('/migrate', async (req, res) => {
    try {
        await migrationRunner.runMigrations();
        res.json({
            success: true,
            message: 'Migrations completed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Migration failed'
        });
    }
});

// Check migration status
router.get('/migrate/status', async (req, res) => {
    try {
        const status = await migrationRunner.getMigrationStatus();
        res.json({ success: true, ...status });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get status'
        });
    }
});

// Rollback a specific migration
router.post('/migrate/rollback/:version', async (req, res) => {
    try {
        const { version } = req.params;
        await migrationRunner.rollbackMigration(version);
        res.json({
            success: true,
            message: `Migration ${version} rolled back successfully`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Rollback failed'
        });
    }
});

export default router;
