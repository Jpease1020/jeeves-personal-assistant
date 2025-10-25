#!/usr/bin/env node

/**
 * Blocklist Fetcher for Enhanced Porn Blocking Extension
 * Downloads and processes community-maintained blocklists from BlocklistProject
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG = {
    BLOCKLIST_URLS: {
        porn: 'https://blocklistproject.github.io/Lists/porn.txt',
        adult: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/data/StevenBlack/hosts',
        dating: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/data/add.2o7Net/hosts',
        gambling: 'https://blocklistproject.github.io/Lists/gambling.txt',
        social: 'https://raw.githubusercontent.com/StevenBlack/hosts/master/data/add.Social/hosts'
    },
    OUTPUT_DIR: path.join(__dirname, '../blocklists'),
    OUTPUT_FILE: 'adult-sites.json'
};

/**
 * Download text content from URL
 */
function downloadText(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                resolve(data);
            });
        }).on('error', reject);
    });
}

/**
 * Parse blocklist text and extract domains
 */
function parseBlocklist(text, category) {
    const domains = new Set();
    const lines = text.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and comments
        if (!trimmed || trimmed.startsWith('#')) {
            continue;
        }
        
        // Parse format: "0.0.0.0 domain.com" or "127.0.0.1 domain.com"
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
            const domain = parts[1].toLowerCase();
            
            // Validate domain format
            if (domain && domain.includes('.') && !domain.includes(' ')) {
                // Remove www. prefix for consistency
                const cleanDomain = domain.replace(/^www\./, '');
                domains.add(cleanDomain);
            }
        }
    }
    
    console.log(`✅ Parsed ${domains.size} domains from ${category} blocklist`);
    return Array.from(domains);
}

/**
 * Generate Chrome extension rules for top domains
 */
function generateChromeRules(domains, maxRules = 5000) {
    const rules = [];
    const topDomains = domains.slice(0, maxRules);
    
    for (let i = 0; i < topDomains.length; i++) {
        const domain = topDomains[i];
        rules.push({
            id: i + 1,
            priority: 1,
            action: {
                type: "redirect",
                redirect: {
                    url: "chrome-extension://__MSG_@@extension_id__/blocked.html"
                }
            },
            condition: {
                urlFilter: `*://${domain}/*`,
                resourceTypes: ["main_frame", "sub_frame"]
            }
        });
    }
    
    console.log(`✅ Generated ${rules.length} Chrome extension rules`);
    return rules;
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting blocklist fetch process...');
    
    try {
        // Ensure output directory exists
        if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
            fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
        }
        
        const blocklistData = {
            version: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString(),
            categories: {},
            total: 0
        };
        
        // Download and parse each blocklist
        for (const [category, url] of Object.entries(CONFIG.BLOCKLIST_URLS)) {
            console.log(`📥 Downloading ${category} blocklist from ${url}...`);
            
            try {
                const text = await downloadText(url);
                const domains = parseBlocklist(text, category);
                blocklistData.categories[category] = domains;
                blocklistData.total += domains.length;
            } catch (error) {
                console.warn(`⚠️  Failed to download ${category} blocklist: ${error.message}`);
                blocklistData.categories[category] = [];
            }
        }
        
        // Generate Chrome extension rules for top domains
        const allDomains = [
            ...blocklistData.categories.porn,
            ...blocklistData.categories.adult,
            ...blocklistData.categories.dating
        ];
        
        const chromeRules = generateChromeRules(allDomains);
        
        // Write blocklist JSON
        const blocklistPath = path.join(CONFIG.OUTPUT_DIR, CONFIG.OUTPUT_FILE);
        fs.writeFileSync(blocklistPath, JSON.stringify(blocklistData, null, 2));
        console.log(`✅ Blocklist saved to ${blocklistPath}`);
        
        // Write Chrome extension rules
        const rulesPath = path.join(__dirname, '../rules.json');
        fs.writeFileSync(rulesPath, JSON.stringify(chromeRules, null, 2));
        console.log(`✅ Chrome rules saved to ${rulesPath}`);
        
        // Print summary
        console.log('\n📊 Summary:');
        console.log(`   Total domains: ${blocklistData.total}`);
        console.log(`   Porn sites: ${blocklistData.categories.porn.length}`);
        console.log(`   Adult themes: ${blocklistData.categories.adult.length}`);
        console.log(`   Dating sites: ${blocklistData.categories.dating.length}`);
        console.log(`   Chrome rules: ${chromeRules.length}`);
        
        console.log('\n🎉 Blocklist fetch completed successfully!');
        
    } catch (error) {
        console.error('❌ Error fetching blocklists:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, parseBlocklist, generateChromeRules };
