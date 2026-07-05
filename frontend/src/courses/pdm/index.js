import Topic1Content from './topics/Topic1_WhatIsPdM'
import Topic1Quiz from './quizzes/Quiz1_PdM'
import Topic2Content from './topics/Topic2_SensorUniverse'
import Topic2Quiz from './quizzes/Quiz2_Sensors'
import Topic3Content from './topics/Topic3_EDA'
import Topic3Quiz from './quizzes/Quiz3_EDA'
import Topic4Content from './topics/Topic4_TimeSeries'
import Topic4Quiz from './quizzes/Quiz4_TimeSeries'
import Topic5Content from './topics/Topic5_ETLPipeline'
import Topic5Quiz from './quizzes/Quiz5_ETL'
import Topic6Content from './topics/Topic6_DataCleaning'
import Topic6Quiz from './quizzes/Quiz6_Cleaning'
import Topic7Content from './topics/Topic7_FeatureEngineering'
import Topic7Quiz from './quizzes/Quiz7_Features'
import Topic8Content from './topics/Topic8_FailureClassification'
import Topic8Quiz from './quizzes/Quiz8_Classification'
import Topic9Content from './topics/Topic9_RUL'
import Topic9Quiz from './quizzes/Quiz9_RUL'
import Topic10Content from './topics/Topic10_ModelArena'
import Topic10Quiz from './quizzes/Quiz10_Models'
import Topic11Content from './topics/Topic11_HyperparameterTuning'
import Topic11Quiz from './quizzes/Quiz11_Tuning'
import Topic12Content from './topics/Topic12_RiskScoring'
import Topic12Quiz from './quizzes/Quiz12_Risk'
import Topic13Content from './topics/Topic13_Deployment'
import Topic13Quiz from './quizzes/Quiz13_Deployment'
import Topic14Content from './topics/Topic14_IndustryApplications'
import Topic14Quiz from './quizzes/Quiz14_Industry'
import Topic15Content from './topics/Topic15_BuildPdMSystem'
import Topic15Quiz from './quizzes/Quiz15_Project'

const pdmCourse = {
  id: 'pdm',
  title: 'Predictive Maintenance',
  subtitle: 'From sensor data to failure prediction — build AI that prevents breakdowns before they happen.',
  description: 'Master the complete predictive maintenance pipeline: IoT sensors, ETL, data cleaning, feature engineering, ML models, risk scoring, and deployment through interactive simulations.',
  icon: '⚙️',
  gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: '#6366f1',
  duration: '2 Weeks · ~18 hrs',
  level: 'Intermediate',
  available: true,

  goal: {
    title: 'The Story of This Course',
    vision: "A factory floor. Machines humming 24/7. Suddenly — BANG. A critical pump fails. Production stops. The repair takes 3 days. Cost? ₹45 lakhs in lost production, ₹8 lakhs in emergency repair, and a furious operations manager asking 'Why didn\'t we see this coming?' This is the problem predictive maintenance solves. Instead of waiting for things to break (reactive) or replacing parts on a fixed schedule whether they need it or not (preventive), you use DATA — sensor readings, work order history, equipment age — to PREDICT failures before they happen. This course takes you through the complete pipeline: from raw sensor data hitting your system, through ETL, cleaning, feature engineering, model training, to a live dashboard that says 'Pump #7 has an 87% chance of failing in the next 14 days — schedule maintenance NOW.' You\'ll build this entire system interactively, step by step.",
    points: [
      'We start with WHY: what is predictive maintenance, how it saves crores, and what data you need. Then we explore the sensor universe — vibration, temperature, pressure, current draw — and how IoT devices collect this data 24/7.',
      'Next, the data pipeline: ETL to ingest messy real-world data, cleaning to handle missing sensors and outliers, and feature engineering to create signals like MTBF (Mean Time Between Failures) and degradation curves that actually predict breakdowns.',
      'Then the ML core: classification models (will it fail?), regression models (when will it fail?), comparing Random Forest vs XGBoost vs LightGBM, and tuning hyperparameters with Optuna for maximum accuracy.',
      'Finally, production deployment: risk scoring systems, alert dashboards, model monitoring, and a full interactive project where YOU build a complete PdM system from scratch — selecting data sources, configuring ETL, training models, and seeing live predictions.',
    ],
    hindiTitle: 'इस कोर्स की कहानी',
    hindiExplanation: 'एक factory सोचो। Machines 24/7 चल रही हैं। अचानक — BANG! एक critical pump fail हो गया। Production रुक गया। Repair में 3 दिन लगे। नुकसान? ₹45 लाख lost production में, ₹8 लाख emergency repair में। Manager पूछ रहा है "पहले से पता क्यों नहीं चला?" यही problem predictive maintenance solve करता है। Machine टूटने का इंतज़ार नहीं करना (reactive), न ही fixed schedule पर parts बदलना (preventive) — बल्कि DATA use करके PREDICT करना कि failure कब होगा। Sensors से temperature, vibration, pressure data आता है। उसे clean करो, features बनाओ (MTBF, degradation), ML model train करो, और dashboard बनाओ जो बोले "Pump #7 में 87% chance है कि अगले 14 दिन में fail होगा — अभी maintenance schedule करो!" इस course में तुम यह पूरी pipeline बनाओगे — data collection से लेकर live predictions तक। Interactive demos से सीखोगे, और अंत में अपना complete PdM system build करोगे।',
  },

  topics: [
    // --- Module 1: Foundations (Day 1-2, ~2.5 hrs) ---
    { id: 1, title: 'What is Predictive Maintenance?', subtitle: 'From reactive firefighting to AI-powered prediction — the four types of maintenance and why PdM saves crores.', icon: '🔧', duration: '~50 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'The Sensor Universe', subtitle: 'Vibration, temperature, pressure, current — how IoT sensors monitor machines 24/7.', icon: '📡', duration: '~50 min', day: 1, content: Topic2Content, quiz: Topic2Quiz,
      storyLink: 'You now understand WHY predictive maintenance matters — it saves crores by catching failures before they happen. But HOW do you actually "listen" to a machine? You can\'t ask a pump "are you feeling okay?" Instead, you attach SENSORS. Vibration sensors detect bearing wear. Temperature sensors catch overheating. Pressure gauges reveal leaks. Current sensors spot motor degradation. These sensors are the EYES and EARS of your PdM system — without them, you\'re blind.' },

    // --- Module 2: Understanding Data (Day 3-4, ~2.5 hrs) ---
    { id: 3, title: 'Exploratory Data Analysis', subtitle: 'Before modeling, LOOK at your data — distributions, correlations, and hidden patterns.', icon: '📊', duration: '~55 min', day: 3, content: Topic3Content, quiz: Topic3Quiz,
      storyLink: 'Sensors are installed. Data is flowing — thousands of readings per day from each machine. But raw data is just numbers. Before you build any ML model, you need to UNDERSTAND your data. What does "normal" look like? What does "about to fail" look like? Are there patterns? Outliers? Missing readings? EDA (Exploratory Data Analysis) is like a doctor examining a patient before prescribing treatment.' },
    { id: 4, title: 'Time Series for Machines', subtitle: 'Trends, seasonality, stationarity — the clock that governs all machine data.', icon: '⏰', duration: '~50 min', day: 3, content: Topic4Content, quiz: Topic4Quiz,
      storyLink: 'EDA showed you patterns in your data. But machine data has a special property: it\'s TIME-ORDERED. A temperature reading at 2 PM depends on the reading at 1 PM. Vibration today is influenced by vibration yesterday. This is time series data, and it has its own rules: trends (gradual degradation), seasonality (machines run hotter in summer), and stationarity. Understanding time series is critical because your features and models must respect the arrow of time.' },

    // --- Module 3: Data Pipeline (Day 5-7, ~3.5 hrs) ---
    { id: 5, title: 'ETL Pipeline Design', subtitle: 'Extract from sensors, transform messy data, load into your ML system — the backbone of PdM.', icon: '🔄', duration: '~55 min', day: 5, content: Topic5Content, quiz: Topic5Quiz,
      storyLink: 'You understand your data and time series patterns. But in the real world, data doesn\'t arrive clean and ready. Sensor readings come from different systems in different formats. Work orders are in Excel. Asset profiles are in a separate database. Equipment manuals are PDFs. ETL (Extract, Transform, Load) is the pipeline that pulls data from ALL these sources, transforms it into a unified format, and loads it into your ML system. Without ETL, you have data chaos.' },
    { id: 6, title: 'Data Cleaning Masterclass', subtitle: 'Missing sensors, outlier spikes, noisy readings — clean data is the foundation of accurate predictions.', icon: '🧹', duration: '~60 min', day: 5, content: Topic6Content, quiz: Topic6Quiz,
      storyLink: 'Your ETL pipeline brings data together. But that data is MESSY. A sensor went offline for 3 hours — now you have gaps. A voltage spike sent a false reading of 9999°C. Some equipment types are labeled "PUMP" in one system and "Centrifugal Pump - Model X" in another. If you feed this garbage into an ML model, you get garbage predictions. Data cleaning is unsexy but it\'s where 80% of a data scientist\'s time goes — and it makes or breaks your predictions.' },
    { id: 7, title: 'Feature Engineering', subtitle: 'MTBF, degradation curves, lifecycle ratios — creating the signals that predict failure.', icon: '🛠️', duration: '~60 min', day: 6, content: Topic7Content, quiz: Topic7Quiz,
      storyLink: 'Your data is clean. But raw sensor readings alone are weak predictors. A temperature of 85°C means nothing without context — is the baseline 80°C (slightly elevated) or 60°C (dangerously hot)? Feature engineering creates MEANINGFUL signals from raw data: deviation from baseline (%), Mean Time Between Failures (MTBF), repair acceleration (are repairs getting more frequent?), lifecycle ratio (age/expected useful life), and rolling statistics. These engineered features are what make ML models actually work.' },

    // --- Module 4: Machine Learning (Day 8-11, ~4 hrs) ---
    { id: 8, title: 'Failure Classification', subtitle: 'Will this machine fail in the next 30 days? Binary classification for predictive maintenance.', icon: '🎯', duration: '~55 min', day: 8, content: Topic8Content, quiz: Topic8Quiz,
      storyLink: 'Your features are ready. Now the ML magic begins. The first question: "Will this machine fail in the next 30 days?" This is a binary classification problem — YES or NO. But PdM classification has a twist: class imbalance. 95% of the time, machines are fine. Only 5% of records represent pre-failure states. A dumb model that always says "no failure" gets 95% accuracy but catches ZERO failures. You need specialized techniques to handle this.' },
    { id: 9, title: 'Remaining Useful Life', subtitle: 'When will it fail? Regression models for RUL prediction — from days to probability curves.', icon: '⏳', duration: '~55 min', day: 8, content: Topic9Content, quiz: Topic9Quiz,
      storyLink: 'Classification tells you IF a machine will fail soon. But the operations team needs MORE: WHEN will it fail? Will the pump last 5 more days or 50? This is Remaining Useful Life (RUL) prediction — a regression problem. RUL helps prioritize: if Pump A has 7 days left and Pump B has 45 days, fix Pump A first. Combined with failure probability, RUL gives you a complete picture for maintenance scheduling.' },
    { id: 10, title: 'Model Arena', subtitle: 'Random Forest vs XGBoost vs LightGBM — which algorithm wins for your data?', icon: '🏟️', duration: '~55 min', day: 9, content: Topic10Content, quiz: Topic10Quiz,
      storyLink: 'You know HOW to build classification and regression models. But WHICH algorithm should you use? Random Forest is robust and interpretable. XGBoost dominates Kaggle competitions. LightGBM is blazing fast for large datasets. Each has strengths and weaknesses for PdM data. In this topic, you\'ll run all three on the same dataset, compare metrics head-to-head, and understand when to use which.' },
    { id: 11, title: 'Hyperparameter Tuning', subtitle: 'Optuna, grid search, cross-validation — squeezing maximum performance from your model.', icon: '🎛️', duration: '~50 min', day: 10, content: Topic11Content, quiz: Topic11Quiz,
      storyLink: 'You picked your algorithm. But a model with default settings is like a car in first gear — it runs, but nowhere near its potential. Hyperparameters (n_estimators, max_depth, learning_rate) dramatically affect performance. Grid search tries every combination (slow). Random search samples randomly (better). Bayesian optimization with Optuna learns from previous trials to find the best config fast. The difference between a tuned and untuned model can be 10-15% in accuracy.' },

    // --- Module 5: Production (Day 12-14, ~3 hrs) ---
    { id: 12, title: 'Risk Scoring & Alert System', subtitle: 'Critical, High, Medium, Low — turning probabilities into actionable maintenance decisions.', icon: '🚨', duration: '~50 min', day: 12, content: Topic12Content, quiz: Topic12Quiz,
      storyLink: 'Your model outputs a probability: "87% chance of failure in 14 days." But the maintenance team doesn\'t think in probabilities — they think in ACTIONS. "Do I schedule a repair today, this week, or next month?" Risk scoring converts model outputs into actionable tiers: CRITICAL (>80%, act now), HIGH (60-80%, schedule this week), MEDIUM (35-60%, monitor closely), LOW (<35%, routine check). This bridge between ML and operations is what makes PdM actually work in production.' },
    { id: 13, title: 'Dashboards & Deployment', subtitle: 'From Jupyter notebook to production — APIs, monitoring, model drift, and retraining.', icon: '📈', duration: '~55 min', day: 13, content: Topic13Content, quiz: Topic13Quiz,
      storyLink: 'Your model is trained, risk scores are calibrated, and alerts are configured. Now the hardest part: getting it into PRODUCTION. A model in a Jupyter notebook helps nobody. You need: an API that serves predictions in real-time, a dashboard that operations teams actually use, monitoring that detects when the model starts degrading (concept drift), and a retraining pipeline that keeps the model fresh. This is where data science becomes engineering.' },
    { id: 14, title: 'Industry Applications', subtitle: 'Manufacturing, energy, transport, healthcare — where predictive maintenance saves lives and crores.', icon: '🏭', duration: '~50 min', day: 14, content: Topic14Content, quiz: Topic14Quiz,
      storyLink: 'You\'ve built the complete PdM pipeline for one factory. But the same techniques work EVERYWHERE machines operate. Wind turbines in Rajasthan. Metro trains in Delhi. MRI machines in hospitals. Oil rigs in the Arabian Sea. Each industry has unique sensors and failure modes, but the CORE PIPELINE is identical: collect data → clean → engineer features → train → predict → act. Understanding the breadth of applications makes you a PdM specialist, not just a one-project wonder.' },

    // --- Module 6: Capstone Project (Day 15-16, ~2 hrs) ---
    { id: 15, title: 'Build Your PdM System', subtitle: 'The grand finale — select data, configure ETL, clean, train, and predict in one interactive pipeline.', icon: '🏗️', duration: '~70 min', day: 15, content: Topic15Content, quiz: Topic15Quiz,
      storyLink: 'You\'ve learned every piece of the puzzle: sensors, ETL, cleaning, features, classification, RUL, model selection, tuning, risk scoring, dashboards. Now it\'s time to put it ALL together. In this interactive project, you\'ll build a complete PdM system from scratch — choosing your data source, configuring the ETL pipeline, selecting cleaning strategies, engineering features, training models, and watching live predictions roll in. This is your portfolio piece — the proof that you can build production-grade predictive maintenance.' },
  ],

  project: null,
  projects: [],

  assignments: [
    { id: 1, title: 'Steel Plant Pump Failure', subtitle: 'Predict failures for industrial centrifugal pumps in a steel manufacturing plant — from sensor data to maintenance schedule.', icon: '🏭', duration: '~50 min' },
    { id: 2, title: 'Wind Turbine Optimization', subtitle: 'Design a predictive maintenance system for a wind farm — optimize turbine uptime and reduce helicopter repair costs.', icon: '💨', duration: '~50 min' },
    { id: 3, title: 'Metro Rail Fleet Health', subtitle: 'Build a fleet-wide health monitoring system for Delhi Metro — predict component failures across 300+ coaches.', icon: '🚇', duration: '~45 min' },
  ],
}

export default pdmCourse
