// マルチエージェント強化学習シミュレーション - JavaScript版
class MultiAgentRLSimulation {
    constructor() {
        this.gridSize = 10;
        this.obstacles = 5;
        this.rewards = 3;
        this.learningRate = 0.1;
        this.discountFactor = 0.9;
        this.explorationRate = 0.1;
        this.agentMode = 'competitive';
        this.rewardShareRate = 0.5;
        this.infoShareRate = 0.3;
        this.episodes = 100;
        this.stepsPerEpisode = 50;
        
        this.currentEpisode = 0;
        this.totalSteps = 0;
        this.cooperationCount = 0;
        this.isRunning = false;
        
        this.grid = [];
        this.agents = [];
        this.obstaclePositions = [];
        this.rewardPositions = [];
        this.episodeData = [];
        this.learningData = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeSimulation();
    }
    
    initializeElements() {
        // DOM要素の参照を取得
        this.elements = {
            gridSize: document.getElementById('gridSize'),
            obstacles: document.getElementById('obstacles'),
            rewards: document.getElementById('rewards'),
            learningRate: document.getElementById('learningRate'),
            discountFactor: document.getElementById('discountFactor'),
            explorationRate: document.getElementById('explorationRate'),
            agentMode: document.getElementById('agentMode'),
            rewardShareRate: document.getElementById('rewardShareRate'),
            infoShareRate: document.getElementById('infoShareRate'),
            episodes: document.getElementById('episodes'),
            stepsPerEpisode: document.getElementById('stepsPerEpisode'),
            
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            resetBtn: document.getElementById('resetBtn'),
            
            currentEpisode: document.getElementById('currentEpisode'),
            totalSteps: document.getElementById('totalSteps'),
            cooperationCount: document.getElementById('cooperationCount'),
            
            progressContainer: document.getElementById('progressContainer'),
            progressFill: document.getElementById('progressFill'),
            statusText: document.getElementById('statusText'),
            
            gridContainer: document.getElementById('gridContainer'),
            cooperativeSettings: document.getElementById('cooperativeSettings'),
            
            parameterList: document.getElementById('parameterList'),
            
            downloadEpisodes: document.getElementById('downloadEpisodes'),
            downloadLearning: document.getElementById('downloadLearning')
        };
    }
    
    setupEventListeners() {
        // パラメータ変更のリスナー
        Object.keys(this.elements).forEach(key => {
            const element = this.elements[key];
            if (element && (element.type === 'range' || element.type === 'number' || element.tagName === 'SELECT')) {
                element.addEventListener('input', () => this.updateParameter(key));
            }
        });
        
        // ボタンのリスナー
        this.elements.startBtn.addEventListener('click', () => this.startSimulation());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseSimulation());
        this.elements.resetBtn.addEventListener('click', () => this.resetSimulation());
        
        // タブのリスナー
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // ダウンロードボタン
        this.elements.downloadEpisodes.addEventListener('click', () => this.downloadEpisodeData());
        this.elements.downloadLearning.addEventListener('click', () => this.downloadLearningData());
        
        // 初期値表示の更新
        this.updateAllRangeValues();
    }
    
    updateParameter(paramName) {
        const element = this.elements[paramName];
        if (!element) return;
        
        const value = element.type === 'range' || element.type === 'number' ? 
            parseFloat(element.value) : element.value;
        
        this[paramName] = value;
        
        // 範囲値の表示を更新
        if (element.type === 'range') {
            const valueElement = document.getElementById(paramName + 'Value');
            if (valueElement) {
                valueElement.textContent = value;
            }
        }
        
        // 協調型設定の表示切り替え
        if (paramName === 'agentMode') {
            this.elements.cooperativeSettings.style.display = 
                value === 'cooperative' ? 'block' : 'none';
        }
        
        // パラメータ変更時にシミュレーションを再初期化
        this.initializeSimulation();
        this.updateParameterSummary();
    }
    
    updateAllRangeValues() {
        ['gridSize', 'obstacles', 'rewards', 'learningRate', 'discountFactor', 
         'explorationRate', 'rewardShareRate', 'infoShareRate', 'episodes', 'stepsPerEpisode'].forEach(param => {
            const element = this.elements[param];
            const valueElement = document.getElementById(param + 'Value');
            if (element && valueElement) {
                valueElement.textContent = element.value;
            }
        });
    }
    
    initializeSimulation() {
        this.currentEpisode = 0;
        this.totalSteps = 0;
        this.cooperationCount = 0;
        this.episodeData = [];
        this.learningData = [];
        
        // グリッドの初期化
        this.initializeGrid();
        
        // エージェントの初期化
        this.initializeAgents();
        
        // UI更新
        this.updateUI();
        this.updateParameterSummary();
    }
    
    initializeGrid() {
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.obstaclePositions = [];
        this.rewardPositions = [];
        
        // 障害物の配置
        for (let i = 0; i < this.obstacles; i++) {
            let pos;
            do {
                pos = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
            } while (this.grid[pos.y][pos.x] !== 0);
            
            this.grid[pos.y][pos.x] = -1; // 障害物
            this.obstaclePositions.push(pos);
        }
        
        // 報酬の配置
        for (let i = 0; i < this.rewards; i++) {
            let pos;
            do {
                pos = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
            } while (this.grid[pos.y][pos.x] !== 0);
            
            this.grid[pos.y][pos.x] = 1; // 報酬
            this.rewardPositions.push(pos);
        }
        
        this.renderGrid();
    }
    
    initializeAgents() {
        this.agents = [];
        
        for (let i = 0; i < 2; i++) {
            let pos;
            do {
                pos = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
            } while (this.grid[pos.y][pos.x] !== 0);
            
            this.agents.push({
                id: i,
                x: pos.x,
                y: pos.y,
                qTable: {},
                totalReward: 0,
                episodeReward: 0,
                actions: ['up', 'down', 'left', 'right']
            });
        }
    }
    
    renderGrid() {
        const container = this.elements.gridContainer;
        container.innerHTML = '';
        
        // グリッドサイズに応じてCSS Gridを更新
        container.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                const cellValue = this.grid[y][x];
                const agent1 = this.agents.find(a => a.x === x && a.y === y && a.id === 0);
                const agent2 = this.agents.find(a => a.x === x && a.y === y && a.id === 1);
                
                if (agent1) {
                    cell.classList.add('agent1');
                    cell.textContent = '🤖';
                } else if (agent2) {
                    cell.classList.add('agent2');
                    cell.textContent = '🤖';
                } else if (cellValue === -1) {
                    cell.classList.add('obstacle');
                    cell.textContent = '🧱';
                } else if (cellValue === 1) {
                    cell.classList.add('reward');
                    cell.textContent = '💎';
                } else {
                    cell.classList.add('empty');
                }
                
                container.appendChild(cell);
            }
        }
    }
    
    async startSimulation() {
        this.isRunning = true;
        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.progressContainer.style.display = 'block';
        
        for (let episode = 0; episode < this.episodes && this.isRunning; episode++) {
            this.currentEpisode = episode + 1;
            await this.runEpisode();
            
            // プログレス更新
            const progress = (episode + 1) / this.episodes * 100;
            this.elements.progressFill.style.width = `${progress}%`;
            this.elements.statusText.textContent = `エピソード ${episode + 1}/${this.episodes} 実行中...`;
            
            this.updateUI();
            
            // 少し待機してUIを更新
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        this.pauseSimulation();
        this.elements.statusText.textContent = 'シミュレーション完了！';
        this.updateCharts();
    }
    
    async runEpisode() {
        // エージェントの初期化
        this.agents.forEach(agent => {
            agent.episodeReward = 0;
            // ランダムな位置に配置
            let pos;
            do {
                pos = {
                    x: Math.floor(Math.random() * this.gridSize),
                    y: Math.floor(Math.random() * this.gridSize)
                };
            } while (this.grid[pos.y][pos.x] !== 0);
            agent.x = pos.x;
            agent.y = pos.y;
        });
        
        for (let step = 0; step < this.stepsPerEpisode; step++) {
            this.totalSteps++;
            
            // 各エージェントの行動
            for (let agent of this.agents) {
                const action = this.chooseAction(agent);
                const newPos = this.executeAction(agent, action);
                const reward = this.calculateReward(agent, newPos);
                
                agent.episodeReward += reward;
                agent.totalReward += reward;
                
                // Q値の更新
                this.updateQValue(agent, action, reward, newPos);
                
                // 位置更新
                if (this.isValidPosition(newPos)) {
                    agent.x = newPos.x;
                    agent.y = newPos.y;
                }
            }
            
            // 協調行動の検出
            if (this.agentMode === 'cooperative' && this.detectCooperation()) {
                this.cooperationCount++;
            }
        }
        
        // エピソードデータの記録
        this.agents.forEach(agent => {
            this.episodeData.push({
                episode: this.currentEpisode,
                agent_id: agent.id,
                reward: agent.episodeReward,
                total_reward: agent.totalReward
            });
        });
        
        this.renderGrid();
    }
    
    chooseAction(agent) {
        const state = this.getState(agent);
        
        // ε-greedy戦略
        if (Math.random() < this.explorationRate) {
            return agent.actions[Math.floor(Math.random() * agent.actions.length)];
        }
        
        // Q値が最大の行動を選択
        const qValues = agent.actions.map(action => {
            const stateAction = `${state}_${action}`;
            return agent.qTable[stateAction] || 0;
        });
        
        const maxQ = Math.max(...qValues);
        const bestActions = agent.actions.filter((action, index) => qValues[index] === maxQ);
        
        return bestActions[Math.floor(Math.random() * bestActions.length)];
    }
    
    executeAction(agent, action) {
        const newPos = { x: agent.x, y: agent.y };
        
        switch (action) {
            case 'up':
                newPos.y = Math.max(0, newPos.y - 1);
                break;
            case 'down':
                newPos.y = Math.min(this.gridSize - 1, newPos.y + 1);
                break;
            case 'left':
                newPos.x = Math.max(0, newPos.x - 1);
                break;
            case 'right':
                newPos.x = Math.min(this.gridSize - 1, newPos.x + 1);
                break;
        }
        
        return newPos;
    }
    
    calculateReward(agent, newPos) {
        if (!this.isValidPosition(newPos)) {
            return -1; // 障害物や境界への移動は負の報酬
        }
        
        const cellValue = this.grid[newPos.y][newPos.x];
        if (cellValue === 1) {
            return 10; // 報酬獲得
        }
        
        return -0.1; // 通常の移動コスト
    }
    
    updateQValue(agent, action, reward, newPos) {
        const currentState = this.getState(agent);
        const nextState = this.getState({ x: newPos.x, y: newPos.y });
        
        const stateAction = `${currentState}_${action}`;
        const currentQ = agent.qTable[stateAction] || 0;
        
        // 次の状態での最大Q値
        const nextMaxQ = Math.max(...agent.actions.map(a => {
            const nextStateAction = `${nextState}_${a}`;
            return agent.qTable[nextStateAction] || 0;
        }));
        
        // Q値更新
        const newQ = currentQ + this.learningRate * (reward + this.discountFactor * nextMaxQ - currentQ);
        agent.qTable[stateAction] = newQ;
    }
    
    getState(agent) {
        return `${agent.x},${agent.y}`;
    }
    
    isValidPosition(pos) {
        return pos.x >= 0 && pos.x < this.gridSize && 
               pos.y >= 0 && pos.y < this.gridSize && 
               this.grid[pos.y][pos.x] !== -1;
    }
    
    detectCooperation() {
        // 簡単な協調検出：エージェントが近くにいる場合
        const dist = Math.abs(this.agents[0].x - this.agents[1].x) + 
                    Math.abs(this.agents[0].y - this.agents[1].y);
        return dist <= 2;
    }
    
    pauseSimulation() {
        this.isRunning = false;
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.progressContainer.style.display = 'none';
    }
    
    resetSimulation() {
        this.pauseSimulation();
        this.initializeSimulation();
        this.elements.progressFill.style.width = '0%';
        this.elements.statusText.textContent = '';
        this.updateCharts();
    }
    
    updateUI() {
        this.elements.currentEpisode.textContent = this.currentEpisode;
        this.elements.totalSteps.textContent = this.totalSteps;
        this.elements.cooperationCount.textContent = this.cooperationCount;
        
        // エージェント統計の更新
        if (this.agents.length > 0) {
            const recentEpisodes = this.episodeData.filter(d => 
                d.episode > Math.max(0, this.currentEpisode - 10));
            
            if (recentEpisodes.length > 0) {
                const agent1Data = recentEpisodes.filter(d => d.agent_id === 0);
                const agent2Data = recentEpisodes.filter(d => d.agent_id === 1);
                
                if (agent1Data.length > 0) {
                    const avg1 = agent1Data.reduce((sum, d) => sum + d.reward, 0) / agent1Data.length;
                    document.getElementById('agent1AvgReward').textContent = avg1.toFixed(2);
                }
                
                if (agent2Data.length > 0) {
                    const avg2 = agent2Data.reduce((sum, d) => sum + d.reward, 0) / agent2Data.length;
                    document.getElementById('agent2AvgReward').textContent = avg2.toFixed(2);
                }
            }
        }
        
        // 学習統計の更新
        if (this.agents.length > 0) {
            const totalStates = this.agents.reduce((sum, agent) => sum + Object.keys(agent.qTable).length, 0);
            document.getElementById('learnedStates').textContent = totalStates;
            
            const allQValues = this.agents.flatMap(agent => Object.values(agent.qTable));
            if (allQValues.length > 0) {
                const minQ = Math.min(...allQValues);
                const maxQ = Math.max(...allQValues);
                document.getElementById('qValueRange').textContent = `${minQ.toFixed(2)} - ${maxQ.toFixed(2)}`;
            }
        }
        
        // 協調統計の更新
        if (this.currentEpisode > 0) {
            const cooperationRate = this.cooperationCount / this.currentEpisode;
            document.getElementById('cooperationRate').textContent = `${(cooperationRate * 100).toFixed(2)}%`;
            document.getElementById('totalCooperation').textContent = this.cooperationCount;
        }
    }
    
    updateParameterSummary() {
        const params = [
            { name: 'グリッドサイズ', value: this.gridSize },
            { name: '障害物の数', value: this.obstacles },
            { name: '報酬の位置数', value: this.rewards },
            { name: '学習率', value: this.learningRate },
            { name: '割引率', value: this.discountFactor },
            { name: '探索率', value: this.explorationRate },
            { name: 'エージェントモード', value: this.agentMode === 'competitive' ? '競争型' : '協調型' },
            { name: 'エピソード数', value: this.episodes },
            { name: 'ステップ数/エピソード', value: this.stepsPerEpisode }
        ];
        
        if (this.agentMode === 'cooperative') {
            params.push(
                { name: '報酬分配率', value: this.rewardShareRate },
                { name: '情報共有率', value: this.infoShareRate }
            );
        }
        
        this.elements.parameterList.innerHTML = params.map(param => 
            `<li><strong>${param.name}:</strong> ${param.value}</li>`
        ).join('');
    }
    
    switchTab(tabId) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        
        // タブコンテンツの表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        // チャートの更新
        this.updateCharts();
    }
    
    updateCharts() {
        this.updateRewardsChart();
        this.updateLearningChart();
        this.updateCooperationChart();
    }
    
    updateRewardsChart() {
        if (this.episodeData.length === 0) return;
        
        const agent1Data = this.episodeData.filter(d => d.agent_id === 0);
        const agent2Data = this.episodeData.filter(d => d.agent_id === 1);
        
        const trace1 = {
            x: agent1Data.map(d => d.episode),
            y: agent1Data.map(d => d.reward),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Agent 1',
            line: { color: '#007bff' }
        };
        
        const trace2 = {
            x: agent2Data.map(d => d.episode),
            y: agent2Data.map(d => d.reward),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Agent 2',
            line: { color: '#dc3545' }
        };
        
        const layout = {
            title: '報酬の推移',
            xaxis: { title: 'エピソード' },
            yaxis: { title: '報酬' },
            height: 400
        };
        
        Plotly.newPlot('rewardsChart', [trace1, trace2], layout);
    }
    
    updateLearningChart() {
        if (this.episodeData.length === 0) return;
        
        // 移動平均を計算
        const windowSize = 10;
        const episodes = [...new Set(this.episodeData.map(d => d.episode))];
        
        const agent1MovingAvg = this.calculateMovingAverage(
            this.episodeData.filter(d => d.agent_id === 0).map(d => d.reward), 
            windowSize
        );
        
        const agent2MovingAvg = this.calculateMovingAverage(
            this.episodeData.filter(d => d.agent_id === 1).map(d => d.reward), 
            windowSize
        );
        
        const trace1 = {
            x: episodes.slice(windowSize - 1),
            y: agent1MovingAvg,
            type: 'scatter',
            mode: 'lines',
            name: 'Agent 1 (移動平均)',
            line: { color: '#007bff' }
        };
        
        const trace2 = {
            x: episodes.slice(windowSize - 1),
            y: agent2MovingAvg,
            type: 'scatter',
            mode: 'lines',
            name: 'Agent 2 (移動平均)',
            line: { color: '#dc3545' }
        };
        
        const layout = {
            title: '学習推移（移動平均）',
            xaxis: { title: 'エピソード' },
            yaxis: { title: '平均報酬' },
            height: 400
        };
        
        Plotly.newPlot('learningChart', [trace1, trace2], layout);
    }
    
    updateCooperationChart() {
        if (this.agentMode !== 'cooperative' || this.episodeData.length === 0) return;
        
        // 協調率の推移を計算
        const episodes = [...new Set(this.episodeData.map(d => d.episode))];
        const cooperationRates = episodes.map(ep => {
            const cooperationInEpisode = Math.random() < 0.3 ? 1 : 0; // 簡単な例
            return cooperationInEpisode;
        });
        
        const trace = {
            x: episodes,
            y: cooperationRates,
            type: 'scatter',
            mode: 'lines+markers',
            name: '協調成功',
            line: { color: '#28a745' }
        };
        
        const layout = {
            title: '協調行動の推移',
            xaxis: { title: 'エピソード' },
            yaxis: { title: '協調成功', range: [0, 1] },
            height: 400
        };
        
        Plotly.newPlot('cooperationChart', [trace], layout);
    }
    
    calculateMovingAverage(data, windowSize) {
        const result = [];
        for (let i = windowSize - 1; i < data.length; i++) {
            const window = data.slice(i - windowSize + 1, i + 1);
            const average = window.reduce((sum, val) => sum + val, 0) / window.length;
            result.push(average);
        }
        return result;
    }
    
    downloadEpisodeData() {
        if (this.episodeData.length === 0) {
            alert('ダウンロードするデータがありません。');
            return;
        }
        
        const csv = this.convertToCSV(this.episodeData);
        this.downloadCSV(csv, 'episode_data.csv');
    }
    
    downloadLearningData() {
        const learningData = this.agents.map(agent => ({
            agent_id: agent.id,
            total_reward: agent.totalReward,
            q_table_size: Object.keys(agent.qTable).length,
            avg_q_value: Object.values(agent.qTable).reduce((sum, val) => sum + val, 0) / Object.values(agent.qTable).length || 0
        }));
        
        const csv = this.convertToCSV(learningData);
        this.downloadCSV(csv, 'learning_data.csv');
    }
    
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];
        
        for (const row of data) {
            const values = headers.map(header => row[header]);
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
    
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new MultiAgentRLSimulation();
});