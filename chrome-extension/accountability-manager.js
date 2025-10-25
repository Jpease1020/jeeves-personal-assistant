// Advanced accountability features for porn blocking
// Provides comprehensive monitoring and reporting

class AccountabilityManager {
    constructor() {
        this.accountabilityPartners = [];
        this.reportingSettings = {
            realTimeAlerts: true,
            dailyReports: true,
            weeklyReports: true,
            monthlyReports: true,
            emergencyAlerts: true
        };

        this.incidentLog = [];
        this.usageStats = {
            totalBlocks: 0,
            totalUnlocks: 0,
            totalSearches: 0,
            totalTimeSpent: 0,
            riskScore: 0
        };
    }

    // Initialize accountability system
    async initializeAccountability() {
        try {
            // Load accountability partners
            await this.loadAccountabilityPartners();

            // Load reporting settings
            await this.loadReportingSettings();

            // Set up reporting schedules
            await this.setupReportingSchedules();

            console.log('Accountability system initialized');
            return true;
        } catch (error) {
            console.error('Error initializing accountability system:', error);
            return false;
        }
    }

    // Load accountability partners
    async loadAccountabilityPartners() {
        const partners = await chrome.storage.local.get(['accountabilityPartners']);
        if (partners.accountabilityPartners) {
            this.accountabilityPartners = partners.accountabilityPartners;
        }
    }

    // Load reporting settings
    async loadReportingSettings() {
        const settings = await chrome.storage.local.get(['reportingSettings']);
        if (settings.reportingSettings) {
            this.reportingSettings = { ...this.reportingSettings, ...settings.reportingSettings };
        }
    }

    // Set up reporting schedules
    async setupReportingSchedules() {
        // Daily report at 9 PM
        chrome.alarms.create('dailyReport', {
            when: this.getNextDailyReportTime(),
            periodInMinutes: 24 * 60
        });

        // Weekly report on Sunday at 10 AM
        chrome.alarms.create('weeklyReport', {
            when: this.getNextWeeklyReportTime(),
            periodInMinutes: 7 * 24 * 60
        });

        // Monthly report on 1st at 11 AM
        chrome.alarms.create('monthlyReport', {
            when: this.getNextMonthlyReportTime(),
            periodInMinutes: 30 * 24 * 60
        });
    }

    // Get next daily report time
    getNextDailyReportTime() {
        const now = new Date();
        const reportTime = new Date(now);
        reportTime.setHours(21, 0, 0, 0); // 9 PM

        if (reportTime <= now) {
            reportTime.setDate(reportTime.getDate() + 1);
        }

        return reportTime.getTime();
    }

    // Get next weekly report time
    getNextWeeklyReportTime() {
        const now = new Date();
        const reportTime = new Date(now);
        reportTime.setHours(10, 0, 0, 0); // 10 AM
        reportTime.setDate(now.getDate() + (7 - now.getDay())); // Next Sunday

        return reportTime.getTime();
    }

    // Get next monthly report time
    getNextMonthlyReportTime() {
        const now = new Date();
        const reportTime = new Date(now);
        reportTime.setHours(11, 0, 0, 0); // 11 AM
        reportTime.setDate(1); // 1st of month

        if (reportTime <= now) {
            reportTime.setMonth(reportTime.getMonth() + 1);
        }

        return reportTime.getTime();
    }

    // Log incident
    logIncident(type, details) {
        const incident = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type: type,
            details: details,
            severity: this.calculateSeverity(type, details)
        };

        this.incidentLog.push(incident);

        // Keep only last 1000 incidents
        if (this.incidentLog.length > 1000) {
            this.incidentLog = this.incidentLog.slice(-1000);
        }

        // Send real-time alert if enabled
        if (this.reportingSettings.realTimeAlerts) {
            this.sendRealTimeAlert(incident);
        }

        // Save to storage
        this.saveIncidentLog();
    }

    // Calculate incident severity
    calculateSeverity(type, details) {
        const severityMap = {
            'porn_block': 'high',
            'emergency_unlock': 'critical',
            'suspicious_search': 'medium',
            'behavioral_pattern': 'high',
            'time_limit_breach': 'medium',
            'incognito_usage': 'high',
            'ai_classification': 'medium'
        };

        return severityMap[type] || 'low';
    }

    // Send real-time alert
    async sendRealTimeAlert(incident) {
        if (incident.severity === 'critical' || incident.severity === 'high') {
            for (const partner of this.accountabilityPartners) {
                await this.sendAlertToPartner(partner, incident);
            }
        }
    }

    // Send alert to accountability partner
    async sendAlertToPartner(partner, incident) {
        try {
            const alertData = {
                partner: partner,
                incident: incident,
                timestamp: new Date().toISOString(),
                user: 'Personal Assistant User'
            };

            // Send to backend
            const response = await fetch('https://personal-assistant-backend-production.up.railway.app/api/accountability-alerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(alertData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log('Alert sent to accountability partner:', partner.name);
        } catch (error) {
            console.error('Error sending alert to partner:', error);
        }
    }

    // Generate daily report
    async generateDailyReport() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const report = {
            date: yesterday.toISOString().split('T')[0],
            summary: {
                totalBlocks: this.getIncidentsByType('porn_block', yesterday).length,
                totalUnlocks: this.getIncidentsByType('emergency_unlock', yesterday).length,
                totalSearches: this.getIncidentsByType('suspicious_search', yesterday).length,
                totalTimeSpent: this.calculateTimeSpent(yesterday),
                riskScore: this.calculateDailyRiskScore(yesterday)
            },
            incidents: this.getIncidentsByDate(yesterday),
            recommendations: this.generateRecommendations(yesterday)
        };

        // Send to accountability partners
        for (const partner of this.accountabilityPartners) {
            await this.sendReportToPartner(partner, report, 'daily');
        }

        return report;
    }

    // Generate weekly report
    async generateWeeklyReport() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const report = {
            period: 'weekly',
            startDate: weekAgo.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            summary: {
                totalBlocks: this.getIncidentsByType('porn_block', weekAgo).length,
                totalUnlocks: this.getIncidentsByType('emergency_unlock', weekAgo).length,
                totalSearches: this.getIncidentsByType('suspicious_search', weekAgo).length,
                totalTimeSpent: this.calculateTimeSpent(weekAgo),
                riskScore: this.calculateWeeklyRiskScore(weekAgo),
                trends: this.calculateTrends(weekAgo)
            },
            incidents: this.getIncidentsByDate(weekAgo),
            recommendations: this.generateRecommendations(weekAgo)
        };

        // Send to accountability partners
        for (const partner of this.accountabilityPartners) {
            await this.sendReportToPartner(partner, report, 'weekly');
        }

        return report;
    }

    // Generate monthly report
    async generateMonthlyReport() {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const report = {
            period: 'monthly',
            startDate: monthAgo.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            summary: {
                totalBlocks: this.getIncidentsByType('porn_block', monthAgo).length,
                totalUnlocks: this.getIncidentsByType('emergency_unlock', monthAgo).length,
                totalSearches: this.getIncidentsByType('suspicious_search', monthAgo).length,
                totalTimeSpent: this.calculateTimeSpent(monthAgo),
                riskScore: this.calculateMonthlyRiskScore(monthAgo),
                trends: this.calculateTrends(monthAgo),
                patterns: this.analyzePatterns(monthAgo)
            },
            incidents: this.getIncidentsByDate(monthAgo),
            recommendations: this.generateRecommendations(monthAgo)
        };

        // Send to accountability partners
        for (const partner of this.accountabilityPartners) {
            await this.sendReportToPartner(partner, report, 'monthly');
        }

        return report;
    }

    // Get incidents by type
    getIncidentsByType(type, sinceDate) {
        return this.incidentLog.filter(incident => {
            const incidentDate = new Date(incident.timestamp);
            return incident.type === type && incidentDate >= sinceDate;
        });
    }

    // Get incidents by date
    getIncidentsByDate(sinceDate) {
        return this.incidentLog.filter(incident => {
            const incidentDate = new Date(incident.timestamp);
            return incidentDate >= sinceDate;
        });
    }

    // Calculate time spent
    calculateTimeSpent(sinceDate) {
        const incidents = this.getIncidentsByType('time_spent', sinceDate);
        return incidents.reduce((total, incident) => total + (incident.details.duration || 0), 0);
    }

    // Calculate daily risk score
    calculateDailyRiskScore(date) {
        const incidents = this.getIncidentsByDate(date);
        let score = 0;

        incidents.forEach(incident => {
            switch (incident.severity) {
                case 'critical': score += 10; break;
                case 'high': score += 5; break;
                case 'medium': score += 2; break;
                case 'low': score += 1; break;
            }
        });

        return Math.min(score, 100);
    }

    // Calculate weekly risk score
    calculateWeeklyRiskScore(sinceDate) {
        const incidents = this.getIncidentsByDate(sinceDate);
        let score = 0;

        incidents.forEach(incident => {
            switch (incident.severity) {
                case 'critical': score += 10; break;
                case 'high': score += 5; break;
                case 'medium': score += 2; break;
                case 'low': score += 1; break;
            }
        });

        return Math.min(score, 100);
    }

    // Calculate monthly risk score
    calculateMonthlyRiskScore(sinceDate) {
        const incidents = this.getIncidentsByDate(sinceDate);
        let score = 0;

        incidents.forEach(incident => {
            switch (incident.severity) {
                case 'critical': score += 10; break;
                case 'high': score += 5; break;
                case 'medium': score += 2; break;
                case 'low': score += 1; break;
            }
        });

        return Math.min(score, 100);
    }

    // Calculate trends
    calculateTrends(sinceDate) {
        const incidents = this.getIncidentsByDate(sinceDate);
        const trends = {
            blocks: 0,
            unlocks: 0,
            searches: 0,
            timeSpent: 0
        };

        incidents.forEach(incident => {
            switch (incident.type) {
                case 'porn_block': trends.blocks++; break;
                case 'emergency_unlock': trends.unlocks++; break;
                case 'suspicious_search': trends.searches++; break;
                case 'time_spent': trends.timeSpent += incident.details.duration || 0; break;
            }
        });

        return trends;
    }

    // Analyze patterns
    analyzePatterns(sinceDate) {
        const incidents = this.getIncidentsByDate(sinceDate);
        const patterns = {
            peakHours: this.findPeakHours(incidents),
            commonSites: this.findCommonSites(incidents),
            commonSearches: this.findCommonSearches(incidents),
            riskFactors: this.identifyRiskFactors(incidents)
        };

        return patterns;
    }

    // Find peak hours
    findPeakHours(incidents) {
        const hourCounts = {};
        incidents.forEach(incident => {
            const hour = new Date(incident.timestamp).getHours();
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });

        return Object.entries(hourCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));
    }

    // Find common sites
    findCommonSites(incidents) {
        const siteCounts = {};
        incidents.forEach(incident => {
            if (incident.details.domain) {
                siteCounts[incident.details.domain] = (siteCounts[incident.details.domain] || 0) + 1;
            }
        });

        return Object.entries(siteCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([site, count]) => ({ site, count }));
    }

    // Find common searches
    findCommonSearches(incidents) {
        const searchCounts = {};
        incidents.forEach(incident => {
            if (incident.type === 'suspicious_search' && incident.details.query) {
                searchCounts[incident.details.query] = (searchCounts[incident.details.query] || 0) + 1;
            }
        });

        return Object.entries(searchCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([query, count]) => ({ query, count }));
    }

    // Identify risk factors
    identifyRiskFactors(incidents) {
        const riskFactors = [];

        // Check for incognito usage
        const incognitoIncidents = incidents.filter(i => i.type === 'incognito_usage');
        if (incognitoIncidents.length > 0) {
            riskFactors.push('Incognito mode usage detected');
        }

        // Check for emergency unlocks
        const unlockIncidents = incidents.filter(i => i.type === 'emergency_unlock');
        if (unlockIncidents.length > 3) {
            riskFactors.push('Multiple emergency unlocks');
        }

        // Check for late night usage
        const lateNightIncidents = incidents.filter(i => {
            const hour = new Date(i.timestamp).getHours();
            return hour >= 22 || hour <= 6;
        });
        if (lateNightIncidents.length > 5) {
            riskFactors.push('Late night usage pattern');
        }

        return riskFactors;
    }

    // Generate recommendations
    generateRecommendations(sinceDate) {
        const incidents = this.getIncidentsByDate(sinceDate);
        const recommendations = [];

        // Check for high unlock frequency
        const unlockIncidents = incidents.filter(i => i.type === 'emergency_unlock');
        if (unlockIncidents.length > 2) {
            recommendations.push('Consider increasing unlock friction or adding more accountability measures');
        }

        // Check for late night usage
        const lateNightIncidents = incidents.filter(i => {
            const hour = new Date(i.timestamp).getHours();
            return hour >= 22 || hour <= 6;
        });
        if (lateNightIncidents.length > 3) {
            recommendations.push('Consider implementing stricter late-night blocking');
        }

        // Check for incognito usage
        const incognitoIncidents = incidents.filter(i => i.type === 'incognito_usage');
        if (incognitoIncidents.length > 0) {
            recommendations.push('Consider blocking incognito mode entirely');
        }

        return recommendations;
    }

    // Send report to partner
    async sendReportToPartner(partner, report, type) {
        try {
            const reportData = {
                partner: partner,
                report: report,
                type: type,
                timestamp: new Date().toISOString()
            };

            const response = await fetch('https://personal-assistant-backend-production.up.railway.app/api/accountability-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reportData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            console.log(`${type} report sent to accountability partner:`, partner.name);
        } catch (error) {
            console.error(`Error sending ${type} report to partner:`, error);
        }
    }

    // Save incident log
    async saveIncidentLog() {
        await chrome.storage.local.set({
            incidentLog: this.incidentLog
        });
    }

    // Add accountability partner
    async addAccountabilityPartner(partner) {
        this.accountabilityPartners.push(partner);
        await chrome.storage.local.set({
            accountabilityPartners: this.accountabilityPartners
        });
    }

    // Remove accountability partner
    async removeAccountabilityPartner(partnerId) {
        this.accountabilityPartners = this.accountabilityPartners.filter(p => p.id !== partnerId);
        await chrome.storage.local.set({
            accountabilityPartners: this.accountabilityPartners
        });
    }

    // Update reporting settings
    async updateReportingSettings(settings) {
        this.reportingSettings = { ...this.reportingSettings, ...settings };
        await chrome.storage.local.set({
            reportingSettings: this.reportingSettings
        });
    }

    // Get accountability summary
    getAccountabilitySummary() {
        return {
            partners: this.accountabilityPartners.length,
            incidents: this.incidentLog.length,
            settings: this.reportingSettings,
            stats: this.usageStats
        };
    }
}

// Usage in blocking logic
const accountabilityManager = new AccountabilityManager();

// Enhanced blocking with accountability
function enhancedAccountabilityBlocking(incidentType, details) {
    // Log the incident
    accountabilityManager.logIncident(incidentType, details);

    // Return blocking decision
    return {
        blocked: true,
        reason: 'Incident logged for accountability',
        type: 'accountability_block'
    };
}
