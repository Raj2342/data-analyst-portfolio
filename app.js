/**
 * Alex Rivera - Portfolio Web Application Javascript
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
            labels: ['SQL & Querying', 'Data Engineering', 'Machine Learning', 'BI & Reporting', 'Stat Analysis', 'Business Strategy'],
            datasets: [{
                label: 'Competency Level',
                data: [95, 88, 85, 92, 87, 82],
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
            imageSrc: "assets/cart-dashboard-inside.png",
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
            ],
            chartConfig: {
                type: 'bar',
                data: {
                    labels: ['Revenue at Risk', 'Margin Saved', 'Rescued Revenue', 'Ad Burn Stopped'],
                    datasets: [{
                        label: 'Financial Impact ($ Millions)',
                        data: [7.0, 1.8, 3.2, 1.1],
                        backgroundColor: [
                            'rgba(245, 101, 101, 0.7)',
                            'rgba(79, 209, 197, 0.7)',
                            'rgba(66, 153, 225, 0.7)',
                            'rgba(79, 209, 197, 0.7)'
                        ],
                        borderColor: [
                            '#F56565',
                            '#38B2AC',
                            '#3182CE',
                            '#38B2AC'
                        ],
                        borderWidth: 1.5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { 
                        legend: { display: false },
                        tooltip: { callbacks: { label: function(context) { return '$' + context.raw + 'M'; } } }
                    },
                    scales: {
                        x: { 
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                            title: { display: true, text: 'USD Millions', font: { size: 9 }, color: '#A0AEC0' },
                            ticks: { color: '#A0AEC0', font: { size: 9 } }
                        },
                        y: { 
                            grid: { display: false },
                            ticks: { color: '#A0AEC0', font: { size: 9 } }
                        }
                    }
                }
            }
        },
        'supply-chain': {
            badge: "Business Intelligence",
            title: "Logistics & Supply Chain Flow Optimization",
            tags: ["PostgreSQL", "Tableau", "dbt", "Airflow", "ETL"],
            context: "A multi-regional supply chain suffered from severe delivery delays due to warehouse transit bottlenecks. The goal was to trace logistical checkpoints, isolate high-frequency delay links, and construct a dashboard to re-route cargo dynamically.",
            achievements: [
                "Centralized disparate warehouse shipping schedules from 5 fulfillment vendors into PostgreSQL databases.",
                "Constructed dbt models creating optimized facts and dimension tables containing clean transit indicators.",
                "Built an interactive Tableau dashboard showcasing heatmaps of logistical delay clusters and cargo bottlenecks.",
                "Reduced average shipping transit delays by 18 hours (15% reduction) in target regions."
            ],
            pipeline: "Raw tracking API signals are pulled and saved to GCS buckets. Airflow triggers python scripts running transformations. DBT processes standard business calculations (Transit Duration, Warehouse Idle Time) and generates dimensional marts.",
            code: `-- dbt model: shipping_transit_telemetry.sql
WITH raw_shipments AS (
    SELECT * FROM {{ source('logistics', 'shipment_records') }}
),
calculated_durations AS (
    SELECT 
        shipment_id,
        destination_state,
        origin_warehouse_id,
        pickup_timestamp,
        delivery_timestamp,
        EXTRACT(EPOCH FROM (delivery_timestamp - pickup_timestamp))/3600 AS transit_duration_hours
    FROM raw_shipments
    WHERE delivery_status = 'COMPLETED'
)
SELECT 
    origin_warehouse_id,
    AVG(transit_duration_hours) AS avg_duration_hours,
    COUNT(shipment_id) AS total_shipments_processed
FROM calculated_durations
GROUP BY origin_warehouse_id`,
            metrics: [
                { value: "-18h", label: "Avg Delivery Delay" },
                { value: "15%", label: "Transit Efficiency Gain" },
                { value: "48k", label: "Shipments Analyzed" },
                { value: "100%", label: "Real-time Visibility" }
            ],
            chartConfig: {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                    datasets: [
                        {
                            label: 'Before Optimization',
                            data: [42, 45, 43, 44, 46, 44],
                            borderColor: '#E53E3E', // Light red line
                            borderWidth: 1.5,
                            borderDash: [4, 4],
                            fill: false,
                            tension: 0.2,
                            pointRadius: 0
                        },
                        {
                            label: 'After dbt Optimization',
                            data: [42, 38, 35, 34, 30, 26],
                            borderColor: '#38B2AC', // Accent Teal
                            backgroundColor: 'rgba(56, 178, 172, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.2,
                            pointRadius: 4,
                            pointBackgroundColor: '#38B2AC'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, labels: { boxWidth: 12, color: '#A0AEC0', font: { size: 9 } } } },
                    scales: {
                        x: { 
                            grid: { display: false },
                            ticks: { color: '#A0AEC0', font: { size: 9 } }
                        },
                        y: { 
                            grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                            title: { display: true, text: 'Average Transit Hours', font: { size: 9 }, color: '#A0AEC0' },
                            ticks: { color: '#A0AEC0', font: { size: 9 } }
                        }
                    }
                }
            }
        },
        sentiment: {
            badge: "Natural Language Processing",
            title: "Real-time Market Sentiment Monitor",
            tags: ["Python", "NLTK", "Airflow", "BigQuery", "Chart.js"],
            context: "Cryptocurrency and modern stock assets fluctuate heavily based on community conversations and news. This dashboard scrapes social comments (Reddit, Twitter API) continuously, scores sentiment indexes, and forecasts price trend patterns.",
            achievements: [
                "Configured robust streaming data scrapers processing over 120 posts per minute under severe API limits.",
                "Applied NLTK VADER sentiment analyzer to tag social feedback as positive, neutral, or negative.",
                "Engineered a correlation pipeline matching rolling sentiment averages with hourly token valuations.",
                "Produced predictive trading signals demonstrating a 91% accuracy correlation on major market indicators."
            ],
            pipeline: "A Python streaming daemon scrapes real-time posts. Airflow pipelines clean token strings, execute lexicon matching to compute score matrices, and persist data in BigQuery warehouses. The web dashboard draws records using a light REST API.",
            code: `import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import requests

# Download VADER lexicon resources
nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()

def process_social_stream(posts):
    scored_dataset = []
    for post in posts:
        # Generate VADER scores
        score = sia.polarity_scores(post['text'])
        compound_score = score['compound']
        
        scored_dataset.append({
            'post_id': post['id'],
            'timestamp': post['created_at'],
            'sentiment_score': compound_score,
            'category': 'POSITIVE' if compound_score >= 0.05 else 'NEGATIVE' if compound_score <= -0.05 else 'NEUTRAL'
        })
    return scored_dataset`,
            metrics: [
                { value: "91%", label: "Trend Correlation" },
                { value: "120/m", label: "Scraped Telemetry" },
                { value: "+30%", label: "Trading Return Indicator" },
                { value: "1.5M", label: "Comments Scored" }
            ],
            chartConfig: {
                type: 'radar',
                data: {
                    labels: ['Crypto Market', 'Tech Equities', 'AI Sectors', 'E-Commerce', 'Clean Energy'],
                    datasets: [
                        {
                            label: 'Sentiment Index (Avg)',
                            data: [85, 78, 92, 65, 70],
                            backgroundColor: 'rgba(56, 178, 172, 0.15)',
                            borderColor: '#38B2AC',
                            borderWidth: 1.5
                        },
                        {
                            label: 'Price Correlation Index',
                            data: [80, 75, 88, 62, 74],
                            backgroundColor: 'rgba(49, 130, 206, 0.15)',
                            borderColor: '#3182CE',
                            borderWidth: 1.5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, labels: { color: '#A0AEC0', font: { size: 8 } } } },
                    scales: {
                        r: { 
                            angleLines: { display: true, color: 'rgba(255, 255, 255, 0.05)' }, 
                            ticks: { display: false }, 
                            grid: { color: 'rgba(255, 255, 255, 0.05)' },
                            pointLabels: { color: '#F7FAFC', font: { family: 'Inter', size: 9, weight: '600' } },
                            min: 50, 
                            max: 100 
                        }
                    }
                }
            }
        }
    };

    // Modal DOM Elements
    const modal = document.getElementById('case-study-modal');
    const modalTitle = document.getElementById('modal-project-title');
    const modalBadge = document.getElementById('modal-project-badge');
    const modalTags = document.getElementById('modal-project-tags');
    const modalDescContext = document.getElementById('modal-desc-context');
    const modalDescAchievements = document.getElementById('modal-desc-achievements');
    const modalDescPipeline = document.getElementById('modal-desc-pipeline');
    const modalCodeSnippet = document.getElementById('modal-code-snippet');
    const modalDescMetrics = document.getElementById('modal-desc-metrics');
    const modalMetricsContainer = document.querySelector('.modal-metrics-container');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    
    let modalChartInstance = null; // Hold current chart instance to destroy/recreate

    // Open Modal Click Handlers on Cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.getAttribute('data-project-id');
            const data = projectData[projectId];
            if (data) {
                populateModal(data);
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Stop scroll
            }
        });
    });

    // Populate Content into Modal
    function populateModal(data) {
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
        modalDescContext.textContent = data.context;

        // Achievements list
        modalDescAchievements.innerHTML = '';
        data.achievements.forEach(ach => {
            const li = document.createElement('li');
            li.textContent = ach;
            modalDescAchievements.appendChild(li);
        });

        // Dynamic Pipeline / Business Questions Tab Title & Content
        const pipelineTabBtn = document.getElementById('modal-tab-pipeline-btn');
        const pipelineHeading = document.getElementById('modal-pipeline-heading');
        const codeWrapper = document.getElementById('modal-code-wrapper');

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
        const tabMetricsHeading = document.querySelector('#tab-metrics h3');
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
        const chartWrapper = document.querySelector('.modal-chart-wrapper');
        if (modalChartInstance) {
            modalChartInstance.destroy();
            modalChartInstance = null;
        }

        const visualCaption = document.querySelector('.modal-visual-caption');
        if (data.imageSrc) {
            chartWrapper.innerHTML = `<img src="${data.imageSrc}" alt="Dashboard Inside" class="contained-dashboard-img">`;
            visualCaption.innerHTML = `<a href="https://app.powerbi.com/view?r=eyJrIjoiOWE2ODY3Y2ItNGM1Yi00ZDhhLTk4ZGUtNDQ3YTI0ZTc2ZTYyIiwidCI6IjM0YmQ4YmVkLTJhYzEtNDFhZS05ZjA4LTRlMGEzZjExNzA2YyJ9" target="_blank" rel="noopener noreferrer" class="live-dashboard-btn"><span class="pulse-dot"></span> Live Power BI Dashboard</a>`;
        } else {
            chartWrapper.innerHTML = `<canvas id="modalInteractiveChart"></canvas>`;
            const modalChartCtx = document.getElementById('modalInteractiveChart').getContext('2d');
            modalChartInstance = new Chart(modalChartCtx, data.chartConfig);
            visualCaption.innerHTML = `<i class="fa-solid fa-chart-line-up"></i> Live Interactive Visualization`;
        }

        // Reset Tabs to active overview
        const tabBtns = document.querySelectorAll('.modal-tab-btn');
        const tabContents = document.querySelectorAll('.modal-tab-content');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        document.querySelector('[data-tab="tab-overview"]').classList.add('active');
        document.getElementById('tab-overview').classList.add('active');
    }

    // Modal Tabs Navigation Logic
    const tabBtns = document.querySelectorAll('.modal-tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card events
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.modal-tab-content').forEach(c => c.classList.remove('active'));
            
            // Set active
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Close Modal Handler
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Resume scroll
    }

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Copy Code snippet to Clipboard
    const copyCodeBtn = document.querySelector('.copy-code-btn');
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(modalCodeSnippet.textContent)
            .then(() => {
                const originalHTML = copyCodeBtn.innerHTML;
                copyCodeBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #48BB78;"></i>';
                setTimeout(() => {
                    copyCodeBtn.innerHTML = originalHTML;
                }, 2000);
            })
            .catch(err => {
                console.error("Failed to copy text: ", err);
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
                successMsg.style.display = 'flex';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHTML;
                form.reset();
            }, 1200);
        }
    });

    resetFormBtn.addEventListener('click', () => {
        successMsg.style.display = 'none';
        form.style.display = 'flex';
    });

});
