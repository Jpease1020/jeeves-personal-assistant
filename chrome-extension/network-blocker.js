// Network-level blocking using DNS and IP filtering
// This provides additional protection at the network level

class NetworkLevelBlocker {
    constructor() {
        this.dnsServers = {
            // Family-friendly DNS servers
            cleanbrowsing: {
                primary: '185.228.168.168',
                secondary: '185.228.169.168',
                description: 'CleanBrowsing Family Filter'
            },
            cloudflare: {
                primary: '1.1.1.3',
                secondary: '1.0.0.3',
                description: 'Cloudflare Family DNS'
            },
            opendns: {
                primary: '208.67.222.222',
                secondary: '208.67.220.220',
                description: 'OpenDNS Family Shield'
            }
        };

        this.blockedIPs = new Set();
        this.blockedDomains = new Set();
        this.whitelistedIPs = new Set();
        this.whitelistedDomains = new Set();
    }

    // Initialize network blocking
    async initializeNetworkBlocking() {
        try {
            // Load blocked IPs and domains
            await this.loadBlockedNetworks();

            // Set up DNS monitoring
            await this.setupDNSMonitoring();

            console.log('Network-level blocking initialized');
            return true;
        } catch (error) {
            console.error('Error initializing network blocking:', error);
            return false;
        }
    }

    // Load blocked networks from various sources
    async loadBlockedNetworks() {
        try {
            // Load from local blocklists
            await this.loadLocalBlocklists();

            // Load from remote sources
            await this.loadRemoteBlocklists();

            // Load from user preferences
            await this.loadUserBlocklists();

        } catch (error) {
            console.error('Error loading blocked networks:', error);
        }
    }

    // Load local blocklists
    async loadLocalBlocklists() {
        // Load from extension's local storage
        const localBlocklists = await chrome.storage.local.get([
            'blockedIPs',
            'blockedDomains',
            'whitelistedIPs',
            'whitelistedDomains'
        ]);

        if (localBlocklists.blockedIPs) {
            localBlocklists.blockedIPs.forEach(ip => this.blockedIPs.add(ip));
        }
        if (localBlocklists.blockedDomains) {
            localBlocklists.blockedDomains.forEach(domain => this.blockedDomains.add(domain));
        }
        if (localBlocklists.whitelistedIPs) {
            localBlocklists.whitelistedIPs.forEach(ip => this.whitelistedIPs.add(ip));
        }
        if (localBlocklists.whitelistedDomains) {
            localBlocklists.whitelistedDomains.forEach(domain => this.whitelistedDomains.add(domain));
        }
    }

    // Load remote blocklists
    async loadRemoteBlocklists() {
        const remoteSources = [
            'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
            'https://raw.githubusercontent.com/blocklistproject/Lists/master/porn.txt',
            'https://raw.githubusercontent.com/blocklistproject/Lists/master/adult.txt'
        ];

        for (const source of remoteSources) {
            try {
                const response = await fetch(source);
                const text = await response.text();
                this.parseBlocklist(text);
            } catch (error) {
                console.error(`Error loading blocklist from ${source}:`, error);
            }
        }
    }

    // Parse blocklist text
    parseBlocklist(text) {
        const lines = text.split('\n');

        lines.forEach(line => {
            line = line.trim();

            // Skip comments and empty lines
            if (line.startsWith('#') || line === '') return;

            // Parse IP and domain
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
                const ip = parts[0];
                const domain = parts[1];

                // Validate IP address
                if (this.isValidIP(ip)) {
                    this.blockedIPs.add(ip);
                }

                // Validate domain
                if (this.isValidDomain(domain)) {
                    this.blockedDomains.add(domain);
                }
            }
        });
    }

    // Load user-defined blocklists
    async loadUserBlocklists() {
        // Load from user settings
        const userSettings = await chrome.storage.local.get(['userBlockedIPs', 'userBlockedDomains']);

        if (userSettings.userBlockedIPs) {
            userSettings.userBlockedIPs.forEach(ip => this.blockedIPs.add(ip));
        }
        if (userSettings.userBlockedDomains) {
            userSettings.userBlockedDomains.forEach(domain => this.blockedDomains.add(domain));
        }
    }

    // Set up DNS monitoring
    async setupDNSMonitoring() {
        // Monitor DNS resolution requests
        chrome.webRequest.onBeforeRequest.addListener(
            (details) => {
                return this.handleDNSRequest(details);
            },
            { urls: ['<all_urls>'] },
            ['requestBody']
        );
    }

    // Handle DNS request
    handleDNSRequest(details) {
        const url = details.url;
        const domain = new URL(url).hostname.toLowerCase();

        // Check if domain is blocked
        if (this.isDomainBlocked(domain)) {
            return {
                redirectUrl: chrome.runtime.getURL('blocked.html?type=network_block&domain=' + domain)
            };
        }

        // Check if IP is blocked
        if (this.isIPBlocked(details.ip)) {
            return {
                redirectUrl: chrome.runtime.getURL('blocked.html?type=network_block&ip=' + details.ip)
            };
        }

        return {};
    }

    // Check if domain is blocked
    isDomainBlocked(domain) {
        // Check whitelist first
        if (this.whitelistedDomains.has(domain)) {
            return false;
        }

        // Check blocked domains
        if (this.blockedDomains.has(domain)) {
            return true;
        }

        // Check subdomains
        const parts = domain.split('.');
        for (let i = 0; i < parts.length; i++) {
            const subdomain = parts.slice(i).join('.');
            if (this.blockedDomains.has(subdomain)) {
                return true;
            }
        }

        return false;
    }

    // Check if IP is blocked
    isIPBlocked(ip) {
        // Check whitelist first
        if (this.whitelistedIPs.has(ip)) {
            return false;
        }

        // Check blocked IPs
        if (this.blockedIPs.has(ip)) {
            return true;
        }

        // Check IP ranges
        for (const blockedIP of this.blockedIPs) {
            if (this.isIPInRange(ip, blockedIP)) {
                return true;
            }
        }

        return false;
    }

    // Check if IP is in range
    isIPInRange(ip, range) {
        if (range.includes('/')) {
            // CIDR notation
            return this.isIPInCIDR(ip, range);
        } else if (range.includes('-')) {
            // Range notation
            return this.isIPInRangeNotation(ip, range);
        } else {
            // Single IP
            return ip === range;
        }
    }

    // Check if IP is in CIDR range
    isIPInCIDR(ip, cidr) {
        const [network, prefixLength] = cidr.split('/');
        const ipNum = this.ipToNumber(ip);
        const networkNum = this.ipToNumber(network);
        const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;

        return (ipNum & mask) === (networkNum & mask);
    }

    // Check if IP is in range notation
    isIPInRangeNotation(ip, range) {
        const [startIP, endIP] = range.split('-');
        const ipNum = this.ipToNumber(ip);
        const startNum = this.ipToNumber(startIP);
        const endNum = this.ipToNumber(endIP);

        return ipNum >= startNum && ipNum <= endNum;
    }

    // Convert IP to number
    ipToNumber(ip) {
        return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    }

    // Validate IP address
    isValidIP(ip) {
        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    // Validate domain
    isValidDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain);
    }

    // Add domain to blocklist
    addBlockedDomain(domain) {
        this.blockedDomains.add(domain);
        this.saveBlockedNetworks();
    }

    // Add IP to blocklist
    addBlockedIP(ip) {
        this.blockedIPs.add(ip);
        this.saveBlockedNetworks();
    }

    // Remove domain from blocklist
    removeBlockedDomain(domain) {
        this.blockedDomains.delete(domain);
        this.saveBlockedNetworks();
    }

    // Remove IP from blocklist
    removeBlockedIP(ip) {
        this.blockedIPs.delete(ip);
        this.saveBlockedNetworks();
    }

    // Add domain to whitelist
    addWhitelistedDomain(domain) {
        this.whitelistedDomains.add(domain);
        this.saveBlockedNetworks();
    }

    // Add IP to whitelist
    addWhitelistedIP(ip) {
        this.whitelistedIPs.add(ip);
        this.saveBlockedNetworks();
    }

    // Save blocked networks to storage
    async saveBlockedNetworks() {
        await chrome.storage.local.set({
            blockedIPs: Array.from(this.blockedIPs),
            blockedDomains: Array.from(this.blockedDomains),
            whitelistedIPs: Array.from(this.whitelistedIPs),
            whitelistedDomains: Array.from(this.whitelistedDomains)
        });
    }

    // Get network statistics
    getNetworkStats() {
        return {
            blockedIPs: this.blockedIPs.size,
            blockedDomains: this.blockedDomains.size,
            whitelistedIPs: this.whitelistedIPs.size,
            whitelistedDomains: this.whitelistedDomains.size,
            totalBlocked: this.blockedIPs.size + this.blockedDomains.size
        };
    }

    // Test network blocking
    async testNetworkBlocking(url) {
        const domain = new URL(url).hostname.toLowerCase();
        const isBlocked = this.isDomainBlocked(domain);

        return {
            url: url,
            domain: domain,
            blocked: isBlocked,
            reason: isBlocked ? 'Domain is in blocklist' : 'Domain is not blocked'
        };
    }
}

// Usage in blocking logic
const networkBlocker = new NetworkLevelBlocker();

// Enhanced blocking with network-level protection
async function enhancedNetworkBlocking(url) {
    const domain = new URL(url).hostname.toLowerCase();

    if (networkBlocker.isDomainBlocked(domain)) {
        return {
            blocked: true,
            reason: 'Domain blocked at network level',
            type: 'network_block'
        };
    }

    return { blocked: false };
}
