/**
 * Raj - Portfolio Web Application Javascript
 * Handles interactive backgrounds, charts, mouse tracking, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. DYNAMIC CANVAS PARTICLE BACKGROUND
    // ==========================================================================
    const canvas = document.getElementById('canvas-bg');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const maxParticles = 60; // Kept optimized for performance
    
    // Mouse interaction states
    const mouse = {
        x: null,
        y: null,
        radius: 150,
        active: false
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
        mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        mouse.active = false;
    });

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Particle Object
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.baseSize = Math.random() * 2.5 + 1.5;
            this.size = this.baseSize;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            this.density = (Math.random() * 20) + 10;
        }

        update() {
            // Drift particles
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off boundaries
            if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
            if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

            // Mouse interact (pull slightly toward mouse or push gently to simulate mesh behavior)
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    // Move slightly towards mouse coordinates
                    this.x += (dx / distance) * force * 0.8;
                    this.y += (dy / distance) * force * 0.8;
                    this.size = this.baseSize * (1 + force * 0.5);
                } else {
                    this.size = this.baseSize;
                }
            } else {
                this.size = this.baseSize;
            }
        }

        draw() {
            ctx.fillStyle = 'rgba(49, 130, 206, 0.4)'; // Primary Accent color
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Initialize particles
    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }
    initParticles();

    // Connect particles with network lines
    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 130) {
                    opacityValue = 1 - (distance / 130);
                    // Use Trust Blue or Data Teal based on index
                    const strokeColor = a % 2 === 0 ? '49, 130, 206' : '56, 178, 172';
                    ctx.strokeStyle = `rgba(${strokeColor}, ${opacityValue * 0.14})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Background Animation Loop
    function animateBackground() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connectParticles();
        requestAnimationFrame(animateBackground);
    }
    animateBackground();


    // ==========================================================================
    // 2. CURSOR GLOW EFFECT
    // ==========================================================================
    const cursorGlow = document.getElementById('cursor-glow');
    
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.opacity = '1';
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseleave', () => {
        cursorGlow.style.opacity = '0';
    });


    // ==========================================================================
    // 3. HEADER SCROLL STATE & SMOOTH SCROLL ROUTING
    // ==========================================================================
    const header = document.querySelector('.header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Scrolled class trigger
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link highlighting during scroll
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Hamburger Menu Toggle
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-nav-overlay .btn');

    mobileToggle.addEventListener('click', () => {
        const isActive = mobileOverlay.classList.toggle('active');
        mobileToggle.innerHTML = isActive ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileOverlay.classList.remove('active');
            mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });


    // ==========================================================================
    // 4. CHART.JS CORE INTEGRATION (HERO & SKILLS RADAR)
    // ==========================================================================
    
    // (A) Hero Mini Dashboard Line Chart (Forecast Model Accuracy)
    const heroCtx = document.getElementById('heroMiniChart').getContext('2d');
    
    // Create gradient fill for Line Chart
    const heroGradientBlue = heroCtx.createLinearGradient(0, 0, 0, 180);
    heroGradientBlue.addColorStop(0, 'rgba(49, 130, 206, 0.25)');
    heroGradientBlue.addColorStop(1, 'rgba(49, 130, 206, 0.0)');

    const heroGradientTeal = heroCtx.createLinearGradient(0, 0, 0, 180);
    heroGradientTeal.addColorStop(0, 'rgba(56, 178, 172, 0.2)');
    heroGradientTeal.addColorStop(1, 'rgba(56, 178, 172, 0.0)');

    new Chart(heroCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Model Accuracy',
                    data: [82, 88, 91, 94, 97, 98.4],
                    borderColor: '#3182CE', // Accent Blue
                    backgroundColor: heroGradientBlue,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointBackgroundColor: '#3182CE'
                },
                {
                    label: 'Baseline Prediction',
                    data: [75, 76, 78, 80, 81, 83],
                    borderColor: '#38B2AC', // Accent Teal
                    backgroundColor: heroGradientTeal,
                    borderWidth: 1.5,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 0,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Kept minimal
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#A0AEC0',
                        font: { size: 9, family: 'Inter' }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#A0AEC0',
                        font: { size: 9, family: 'Inter' },
                        callback: function(value) { return value + '%'; }
                    },
                    min: 60,
                    max: 100
                }
            }
        }
    });

    // (B) Skills & Core Stack Radar Chart
    const radarCtx = document.getElementById('skillsRadarChart').getContext('2d');
    
    new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: ['SQL & Querying', 'Data Engineering', 'Data Modeling', 'BI & Reporting', 'Cloud Warehousing', 'Stat Analysis', 'Business Strategy'],
            datasets: [{
                label: 'Competency Level',
                data: [90, 85, 85, 90, 80, 75, 80],
                backgroundColor: 'rgba(49, 130, 206, 0.16)', // Blue fill
                borderColor: '#3182CE',
                borderWidth: 2,
                pointBackgroundColor: '#38B2AC', // Teal points
                pointBorderColor: '#FFF',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(160, 174, 192, 0.25)'
                    },
                    grid: {
                        color: 'rgba(160, 174, 192, 0.2)'
                    },
                    pointLabels: {
                        color: '#F7FAFC',
                        font: {
                            family: 'Inter',
                            size: 11,
                            weight: '600'
                        }
                    },
                    ticks: {
                        display: false,
                        maxTicksLimit: 5
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });


    // ==========================================================================
    // 5. 3D PARALLAX TILT EFFECT (VanillaTilt.js Custom Glare Init)
    // ==========================================================================
    if (typeof VanillaTilt !== 'undefined') {
        // Apply Tilt with custom glass-like glare properties
        VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
            max: 8,
            speed: 500,
            glare: true,
            "max-glare": 0.12,
            scale: 1.01,
            transition: true,
            axis: null,
            reset: true
        });

        // Add dynamically updated style values on mousemove for elements (to create mouse tracker spotlight effect)
        const tiltCards = document.querySelectorAll(".glass-card");
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--x', `${x}px`);
                card.style.setProperty('--y', `${y}px`);
            });
        });
    }


    // ==========================================================================
    // 6. CASE STUDY MODAL INJECTION & INTERACTIVE VISUALIZATIONS
    // ==========================================================================
    
    // Project Detailed Data Store
    const projectData = {
        ecommerce: {
            badge: "E-COMMERCE ANALYTICS",
            title: "Promotional Waste Audit: Cart Abandonment & Margin Optimization",
            dashboardUrl: "https://app.powerbi.com/view?r=eyJrIjoiOWE2ODY3Y2ItNGM1Yi00ZDhhLTk4ZGUtNDQ3YTI0ZTc2ZTYyIiwidCI6IjM0YmQ4YmVkLTJhYzEtNDFhZS05ZjA4LTRlMGEzZjExNzA2YyJ9",
            dashboardBtnText: "👉 Click here to see full dashboard",
            githubUrl: "https://github.com/Raj2342/cart-abendment--dbt",
            tags: ["SQL", "Python", "Tableau", "Business Intelligence"],
            context: "A US e-commerce startup generating $10M annually faced a 70% cart abandonment rate, leaving $7M at risk. The core issue was a 'dumb discount system' that automatically sent a 10% discount to every abandoned cart. This created a massive two-fold financial bleed:",
            achievements: [
                "Margin Erosion: The system inadvertently rewarded 'Safe Buyers' (high-intent, high-velocity users) with discounts they didn't need, setting profit margins on fire.",
                "Wasted Ad Spend: The marketing team burned retargeting budgets on 'Window Shoppers' (users with stagnant profiles and absurdly high cart values) who had zero purchasing intent."
            ],
            pipelineTabName: "Business Questions",
            questions: [
                { title: "The Baseline", detail: "How much money is actually sitting in abandoned carts?" },
                { title: "The Margin Bleed", detail: "Who are the 'Safe Buyers' we are accidentally giving discounts to?" },
                { title: "The Rescue Target", detail: "Who are the 'Hesitant Buyers' that actually need the 10% pop-up to convert?" },
                { title: "The Noise", detail: "Who are the 'Window Shoppers' we should ignore completely?" }
            ],
            metricsHeading: "Executive Financial Breakdown",
            metricsDescription: "Top-level financial metrics highlighting total margin erosion, actual baseline revenue, and the total recoverable capital after optimizing the discount strategy.",
            metrics: [
                { value: "$3.89bn", label: "Potential Revenue" },
                { value: "$1.73bn", label: "Actual Revenue" },
                { value: "$2.17bn", label: "Revenue Bleed" },
                { value: "$1.33bn", label: "Recoverable Revenue" }
            ]
        },
        'audio-streaming': {
            badge: "B2C SaaS / AUDIO STREAMING",
            title: "LTV-Based Acquisition Strategy: Optimizing Marketing Spend",
            dashboardUrl: "https://app.powerbi.com/view?r=eyJrIjoiZDY3ODEzYTctOGY3MS00MDQ0LWEwZWMtZDcxYTM2MjJmY2Y0IiwidCI6IjM0YmQ4YmVkLTJhYzEtNDFhZS05ZjA4LTRlMGEzZjExNzA2YyJ9",
            dashboardBtnText: "👉 CLICK HERE TO SEE FULL DASHBOARD",
            githubUrl: "https://github.com/Raj2342/Marketing-channel-roi",
            tags: ["SQL", "Power BI", "Python", "Cohort Analysis"],
            context: "For a subscription audio streaming app, not all acquired customers are created equal. The business was burning cash by spending acquisition budgets on low-value users who churned after a single month of service. The objective was to join member profiles and transaction logs to identify which registration channels produced 'Power Users' (12+ months retention) and shift the marketing budget accordingly.<br><br><strong>The Core Metric:</strong><div class=\"formula-block\" style=\"display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: rgba(79, 209, 197, 0.05); border: 1px solid rgba(79, 209, 197, 0.15); padding: 16px; border-radius: 8px; margin: 16px 0; font-family: 'Roboto Mono', monospace; font-size: 1rem; color: var(--accent-teal); width: 100%;\"><span style=\"font-weight: 700;\">LTV</span><span>=</span><div style=\"display: inline-flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1; padding: 0 4px;\"><span style=\"border-bottom: 1.5px solid var(--accent-teal); padding-bottom: 2px;\">ARPU</span><span style=\"padding-top: 2px;\">Churn Rate</span></div><span>×</span><span>Gross Margin</span></div>",
            achievements: [
                "Identified that low-CAC channels (e.g., social ads) yielded a high volume of 'serial churners' resulting in net profit loss.",
                "Proved that high-CAC channels (e.g., targeted search) acquired loyal customers with a 5x higher Lifetime Value, justifying a complete reallocation of ad spend."
            ],
            pipelineTabName: "Business Questions",
            questions: [
                { title: "1. The Revenue Contribution Question", detail: '"Which registration channels are actually paying our bills?" (Calculated Average Net Revenue Per User by subtracting list price from actual amount paid to expose heavy discount channels).' },
                { title: "2. The \"Survival\" Question", detail: '"What is the expected \'Active Life\' of a user from each channel?" (Calculated Mean Tenure in days to map survival curves across 3, 6, and 12 months).' },
                { title: "3. The \"Discount Trap\" Analysis", detail: '"Are we acquiring \'Serial Churners\' through promos?" (Flagged discounted users to track 30-day churn rates against full-price users).' },
                { title: "4. The Payment Friction Question", detail: '"Does the acquisition channel dictate the payment method (and thus the churn)?" (Mapped registration source to payment methods to identify the highest LTV \'Golden Path\').' },
                { title: "5. The CAC Payback \"Proxy\"", detail: '"How many months does it take to \'break even\' on a user from this channel?" (Built a What-If model in Power BI to calculate Months to Payback based on estimated acquisition costs).' }
            ],
            metricsHeading: "VIP User Revenue Contribution",
            metricsDescription: "Performance parameters isolating the financial impact of 'Power Users' versus the total customer base, validating the shift in acquisition strategy.",
            metrics: [
                { value: "2M", label: "Total Customers" },
                { value: "$110.1999M", label: "Expected Amount" },
                { value: "557.97K", label: "Total Vip User" },
                { value: "$63.79M", label: "Vip User Amount" }
            ]
        },
        'market-basket': {
            badge: "E-COMMERCE / RETAIL ANALYTICS",
            title: "Market Basket Analysis: The Cross-Selling Engine",
            tags: ["SQL", "Python", "Tableau", "Apriori"],
            context: "For a grocery delivery company, maximizing revenue requires increasing the Average Order Value (AOV) per checkout. Forcing irrelevant items onto customers causes friction, so the objective was to identify products that are organically bought together to power a 'Frequently Bought Together' recommendation engine.",
            achievements: [
                "Identified 'Anchor' products that drive total basket volume to optimize promotional discounts.",
                "Calculated 'Directional Pull' between product pairs to determine which items lead a sale and which merely follow, preventing wasted marketing spend."
            ],
            pipelineTabName: "Business Questions",
            questions: [
                { title: "1. What are the \"Anchor\" Products? (The Cart Drivers)", detail: "Calculated order volume and Average Basket Size to identify high-volume staples that drive traffic." },
                { title: "2. What are the Top 50 \"Frequently Bought Together\" Pairs?", detail: "Used SQL SELF JOINs to identify exact item-to-item relationships that happen consistently to power UI recommendations." },
                { title: "3. What is the \"Directional Pull\" of a Pair? (Lead vs. Follow)", detail: "Calculated conditional probability to determine if discounting a specific item organically drives the sale of its paired counterpart." },
                { title: "4. Are these pairs \"Impulse Buys\" or \"Habitual Reorders\"?", detail: "Cross-referenced top pairs with reorder flags to calculate the Reorder Ratio, isolating habitual purchases for \"Subscribe & Save\" targeting." },
                { title: "5. Demographic-Based Bundling", detail: "Joined transaction data with demographics to design specific product bundles tailored to high-income versus budget shoppers." },
                { title: "6. The Discount Trap & Halo Effect", detail: "Analyzed promotional data to reveal if customers buying discounted items also purchased full-priced items, validating true promotion profitability." }
            ],
            metricsHeading: "Cross-Sell Telemetry Breakdown",
            metricsDescription: "Key metrics showcasing bundling efficiency, recommendation accuracy, and transactional lift.",
            metrics: [
                { value: "2.8x", label: "AOV Bundling Lift" },
                { value: "88%", label: "Recommendation Accuracy" },
                { value: "+14.6%", label: "Average Order Value Lift" },
                { value: "1.4M", label: "Transactions Processed" }
            ],
            dashboardUrl: "https://public.tableau.com/views/OmniMart_Command_Center_Final/Home",
            dashboardBtnText: "👉 CLICK HERE TO SEE FULL DASHBOARD",
            githubUrl: "https://github.com/Raj2342/market-basket-analysis"
        },
        'iowa-liquor': {
            badge: "MARKET SHARE & COMPETITIVE INTELLIGENCE",
            title: "Market Share Recovery Strategy: Iowa Liquor Sales",
            tags: ["SQL", "Power BI", "Geospatial Analysis", "DAX"],
            context: "Our brand is bleeding market share and physical shelf space, but our sales and executive teams lack the localized, tactical data required to pinpoint exactly where we are losing, which specific competitors are beating us, and which individual stores we must target to recover lost revenue.",
            achievements: [
                "Pinpointed geographical market share bleed and identified exact cities and counties with critical distribution gaps.",
                "Mapped store-level product assortments, providing field sales reps with actionable targets to win back physical shelf space.",
                "Tracked seasonal buying peaks to optimize revenue capture against major market players during high-volume months."
            ],
            pipelineTabName: "Business Questions",
            questions: [
                { title: "1. Market Share & Store Presence", detail: "Are we losing ground to our primary competitor in overall market share and physical store presence?" },
                { title: "2. Geographic Bleed Analysis", detail: "Geographically, where is our specific brand bleeding the most compared to the overall market?" },
                { title: "3. Localized Distribution Gaps", detail: "Within our target counties, which specific cities have the largest distribution gaps where our competitor's products are more widely available than ours?" },
                { title: "4. Store-Level Assortment Gaps", detail: "At the exact store level, what specific product assortment or sales velocity gaps exist that our sales reps can action immediately to win back revenue?" },
                { title: "5. Peak Buying Seasons", detail: "When are the peak buying seasons for the overall category, and are we capturing our expected share of revenue during those high-volume months compared to the major market players?" }
            ],
            metricsHeading: "Market Recovery Telemetry",
            metricsDescription: "Key telemetry indicators tracking shelf space recovery, store distribution coverage, and competitive market share gains.",
            metrics: [
                { value: "18.2%", label: "Market Share Bleed Halted" },
                { value: "940+", label: "Target Stores Mapped" },
                { value: "+$2.4M", label: "Revenue Opportunity Identified" },
                { value: "12%", label: "Distribution Gap Closed" }
            ],
            dashboardUrl: "https://app.powerbi.com/view?r=eyJrIjoiYmE0NGE1ZGEtOTlhYy00N2ZkLTliNzYtODIzNzZhMjkyOWYwIiwidCI6IjM0YmQ4YmVkLTJhYzEtNDFhZS05ZjA4LTRlMGEzZjExNzA2YyJ9",
            dashboardBtnText: "👉 CLICK HERE TO SEE FULL DASHBOARD",
            githubUrl: "https://github.com/Raj2342/iowa-liquor-analysis"
        }

    };

    // Modal & Telemetry Scoped Logic
    let activeModal = null;
    let modalChartInstance = null; // Hold current chart instance to destroy/recreate

    // Global Modal Trigger functions
    window.openModal = function(modalId, projectId) {
        const modalEl = document.getElementById(modalId);
        const data = projectData[projectId];
        if (modalEl && data) {
            activeModal = modalEl;
            populateModal(data, modalEl);
            modalEl.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop scroll
        }
    };

    window.closeModal = function(modalId) {
        const modalEl = document.getElementById(modalId);
        if (modalEl) {
            modalEl.classList.remove('active');
            document.body.style.overflow = ''; // Resume scroll
            if (activeModal === modalEl) {
                activeModal = null;
            }
        }
    };

    // Close Modal triggers via event delegation
    document.querySelectorAll('.modal-overlay').forEach(modalEl => {
        modalEl.addEventListener('click', (e) => {
            if (e.target === modalEl) {
                closeModal(modalEl.id);
            }
        });
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalEl = btn.closest('.modal-overlay');
            if (modalEl) {
                closeModal(modalEl.id);
            }
        });
    });

    // Populate Content into Modal
    function populateModal(data, modalEl) {
        const modalTitle = modalEl.querySelector('.modal-project-title');
        const modalBadge = modalEl.querySelector('.modal-project-badge');
        const modalTags = modalEl.querySelector('.modal-project-tags');
        const modalDescContext = modalEl.querySelector('.modal-desc-context');
        const modalDescAchievements = modalEl.querySelector('.modal-desc-achievements');
        const modalDescPipeline = modalEl.querySelector('.modal-desc-pipeline');
        const modalCodeSnippet = modalEl.querySelector('.modal-code-snippet');
        const modalDescMetrics = modalEl.querySelector('.modal-desc-metrics');
        const modalMetricsContainer = modalEl.querySelector('.modal-metrics-container');

        modalTitle.textContent = data.title;
        modalBadge.textContent = data.badge;
        
        // Tags
        modalTags.innerHTML = '';
        data.tags.forEach(tag => {
            const span = document.createElement('span');
            span.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${tag}`;
            modalTags.appendChild(span);
        });

        // Overview / Context
        modalDescContext.innerHTML = data.context;

        // Achievements list
        modalDescAchievements.innerHTML = '';
        data.achievements.forEach(ach => {
            const li = document.createElement('li');
            li.textContent = ach;
            modalDescAchievements.appendChild(li);
        });

        // Dynamic Pipeline / Business Questions Tab Title & Content
        const pipelineTabBtn = modalEl.querySelector('.modal-tab-pipeline-btn');
        const pipelineHeading = modalEl.querySelector('.modal-pipeline-heading');
        const codeWrapper = modalEl.querySelector('.modal-code-wrapper');

        if (data.pipelineTabName) {
            pipelineTabBtn.textContent = data.pipelineTabName;
        } else {
            pipelineTabBtn.textContent = "Data Pipeline";
        }

        if (data.questions) {
            // Populate Business Questions diagnostic framework
            pipelineHeading.textContent = "Diagnostic Framework & Business Questions";
            
            let htmlContent = `<div class="business-questions-list" style="display: flex; flex-direction: column; gap: 16px; margin-top: 10px;">`;
            data.questions.forEach(q => {
                htmlContent += `
                    <div class="question-item" style="border-left: 3px solid var(--accent-blue); padding-left: 14px;">
                        <h4 style="font-size: 0.95rem; color: var(--text-primary); font-weight: 700; margin-bottom: 4px;">${q.title}</h4>
                        <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin: 0;">${q.detail}</p>
                    </div>
                `;
            });
            htmlContent += `</div>`;
            modalDescPipeline.innerHTML = htmlContent;
            codeWrapper.style.display = 'none';
        } else {
            // Standard Pipeline Tab Content
            pipelineHeading.textContent = "Data Pipeline & Architecture";
            modalDescPipeline.textContent = data.pipeline;
            codeWrapper.style.display = 'block';
            modalCodeSnippet.textContent = data.code;
        }

        // Metrics Tab & General layout
        const tabMetricsHeading = modalEl.querySelector('.modal-tab-content[id^="tab-metrics"] h3');
        if (data.metricsHeading) {
            tabMetricsHeading.textContent = data.metricsHeading;
        } else {
            tabMetricsHeading.textContent = "Analytical Impact & Validation";
        }

        if (data.metricsDescription) {
            modalDescMetrics.textContent = data.metricsDescription;
        } else {
            modalDescMetrics.textContent = "Detailed validation outputs derived from test splits, real-time feedback datasets, and system run logs.";
        }
        modalMetricsContainer.innerHTML = '';
        data.metrics.forEach(m => {
            const box = document.createElement('div');
            box.className = 'modal-metric-box';
            box.innerHTML = `
                <span class="modal-metric-val">${m.value}</span>
                <span class="modal-metric-lbl">${m.label}</span>
            `;
            modalMetricsContainer.appendChild(box);
        });

        // Handle dynamic visual panels (image or canvas chart)
        const chartWrapper = modalEl.querySelector('.modal-chart-wrapper');
        if (modalChartInstance) {
            modalChartInstance.destroy();
            modalChartInstance = null;
        }

        if (chartWrapper) {
            if (data.imageSrc) {
                chartWrapper.style.display = 'flex';
                if (data.imageSrc === 'omnimart_chart.png') {
                    chartWrapper.innerHTML = `<img src="omnimart_chart.png" alt="OmniMart Market Basket Chart" style="width: 100%; height: auto; max-height: 380px; object-fit: contain; border-radius: 8px; display: block; margin: 0 auto 20px auto;">`;
                } else if (data.imageSrc === 'iowa_liquor_chart.png') {
                    chartWrapper.innerHTML = `<img src="iowa_liquor_chart.png" alt="Iowa Liquor Market Share Chart" style="width: 100%; height: auto; max-height: 380px; object-fit: contain; border-radius: 8px; display: block; margin: 0 auto 20px auto;">`;
                } else {
                    chartWrapper.innerHTML = `<img src="${data.imageSrc}" alt="Dashboard Inside" class="contained-dashboard-img">`;
                }
            } else if (data.chartConfig) {
                chartWrapper.style.display = 'flex';
                chartWrapper.innerHTML = `<canvas></canvas>`;
                const modalChartCtx = chartWrapper.querySelector('canvas').getContext('2d');
                if (typeof Chart !== 'undefined') {
                    modalChartInstance = new Chart(modalChartCtx, data.chartConfig);
                }
            } else {
                chartWrapper.style.display = 'none';
                chartWrapper.innerHTML = '';
            }
        }

        const visualCaption = modalEl.querySelector('.modal-visual-caption');
        if (data.dashboardUrl) {
            let html = `<div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">`;
            html += `<a href="${data.dashboardUrl}" target="_blank" rel="noopener noreferrer" class="live-dashboard-btn"><span class="pulse-dot"></span> ${data.dashboardBtnText || 'Live Interactive Visualization'}</a>`;
            if (data.githubUrl) {
                html += `<a href="${data.githubUrl}" target="_blank" rel="noopener noreferrer" class="live-dashboard-btn"><i class="fa-brands fa-github"></i> GitHub Repository</a>`;
            }
            html += `</div>`;
            visualCaption.innerHTML = html;
        } else {
            visualCaption.innerHTML = `<i class="fa-solid fa-chart-line-up"></i> Live Interactive Visualization`;
        }

        // Reset Tabs to active overview
        const tabBtns = modalEl.querySelectorAll('.modal-tab-btn');
        const tabContents = modalEl.querySelectorAll('.modal-tab-content');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        modalEl.querySelector('[data-tab^="tab-overview"]').classList.add('active');
        modalEl.querySelector('.modal-tab-content[id^="tab-overview"]').classList.add('active');
    }

    // Modal Tabs Navigation Logic
    const tabBtns = document.querySelectorAll('.modal-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card events
            const targetTab = btn.getAttribute('data-tab');
            const parentModal = btn.closest('.modal-overlay');
            if (parentModal) {
                // Remove active classes
                parentModal.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
                parentModal.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
                
                // Set active
                btn.classList.add('active');
                parentModal.querySelector(`#${targetTab}`).classList.add('active');
            }
        });
    });

    // Copy Code snippet to Clipboard
    const copyCodeBtns = document.querySelectorAll('.copy-code-btn');
    copyCodeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const parentModal = btn.closest('.modal-overlay');
            if (parentModal) {
                const codeSnippet = parentModal.querySelector('.modal-code-snippet');
                navigator.clipboard.writeText(codeSnippet.textContent)
                    .then(() => {
                        const originalHTML = btn.innerHTML;
                        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #48BB78;"></i>';
                        setTimeout(() => {
                            btn.innerHTML = originalHTML;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error("Failed to copy text: ", err);
                    });
            }
        });
    });


    // ==========================================================================
    // 7. CONTACT FORM VALIDATIONS & FEEDBACK VISUALIZATION
    // ==========================================================================
    const form = document.getElementById('portfolio-contact-form');
    const successMsg = document.querySelector('.form-success-message');
    const resetFormBtn = document.querySelector('.reset-form-btn');
    
    // Validate email pattern helper
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    if (form) {
        // Input blur dynamic checking
        const inputsToValidate = form.querySelectorAll('input[required], textarea[required]');
        inputsToValidate.forEach(input => {
            input.addEventListener('blur', () => {
                checkFieldValidity(input);
            });
            
            input.addEventListener('input', () => {
                if (input.parentElement.classList.contains('invalid')) {
                    checkFieldValidity(input);
                }
            });
        });

        function checkFieldValidity(field) {
            let isValid = true;
            if (field.value.trim() === '') {
                isValid = false;
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                isValid = false;
            }

            if (isValid) {
                field.parentElement.classList.remove('invalid');
            } else {
                field.parentElement.classList.add('invalid');
            }
            return isValid;
        }

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isFormValid = true;
            inputsToValidate.forEach(input => {
                const isFieldValid = checkFieldValidity(input);
                if (!isFieldValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Simulate API submit delay
                const submitBtn = form.querySelector('.form-submit-btn');
                const originalBtnHTML = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Processing...</span> <i class="fa-solid fa-circle-notch fa-spin"></i>';
                
                setTimeout(() => {
                    form.style.display = 'none';
                    if (successMsg) successMsg.style.display = 'flex';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                    form.reset();
                }, 1200);
            }
        });

        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => {
                if (successMsg) successMsg.style.display = 'none';
                form.style.display = 'flex';
            });
        }
    }

    // Carousel navigation scrolling
    const projectGrid = document.querySelector('.projects-grid');
    const slideLeftBtn = document.getElementById('slide-left');
    const slideRightBtn = document.getElementById('slide-right');
    const scrollAmount = 380; 

    if (slideLeftBtn && slideRightBtn && projectGrid) {
        slideLeftBtn.addEventListener('click', () => {
            projectGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        slideRightBtn.addEventListener('click', () => {
            projectGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }

});

