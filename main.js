// 角色设定器 - Obsidian插件主文件
const { Plugin, ItemView, WorkspaceLeaf, TFile, Notice, PluginSettingTab } = require('obsidian');

const CHARACTER_CREATOR_VIEW_TYPE = 'character-creator-view';

class CharacterCreatorView extends ItemView {
    constructor(leaf) {
        super(leaf);
        this.characterCreator = null;
    }

    getViewType() {
        return CHARACTER_CREATOR_VIEW_TYPE;
    }

    getDisplayText() {
        try {
            const plugin = this.app.plugins.plugins['obsidian-character-creator'];
            return plugin && plugin.settings ? plugin.settings.displayName : '角色设定器';
        } catch (error) {
            return '角色设定器';
        }
    }

    getIcon() {
        return 'users';
    }

    async onOpen() {
        this.characterCreator = new CharacterCreator(this.containerEl, this.app);
        this.characterCreator.init();
    }

    async onClose() {
        if (this.characterCreator) {
            this.characterCreator.destroy();
        }
    }
}

class CharacterCreatorPlugin extends Plugin {
    async onload() {
        console.log('角色设定器插件已加载');

        // 加载设置
        await this.loadSettings();

        // 确保设置已正确初始化
        if (!this.settings) {
            this.settings = {
                displayName: '角色设定器',
                dataFolder: 'character-creator',
                imageFolder: 'character-images',
                autoBackup: true,
                backupInterval: 7,
                maxBackups: 10
            };
        }

        // 注册视图类型
        this.registerView(
            CHARACTER_CREATOR_VIEW_TYPE,
            (leaf) => new CharacterCreatorView(leaf)
        );

        // 添加右键菜单命令
        this.addRibbonIcon('users', this.settings.displayName || '打开角色设定器', () => {
            this.activateView();
        });

        // 添加命令
        this.addCommand({
            id: 'open-character-creator',
            name: this.settings.displayName || '打开角色设定器',
            callback: () => {
                this.activateView();
            }
        });

        // 添加配置命令
        this.addCommand({
            id: 'configure-character-creator',
            name: '配置角色设定器',
            callback: () => {
                this.showConfigurationModal();
            }
        });

        // 添加文件路径设置命令
        this.addCommand({
            id: 'set-file-paths',
            name: '设置文件保存路径',
            callback: () => {
                this.showFilePathModal();
            }
        });
    }

    showConfigurationModal() {
        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">角色设定器配置</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="configurationForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">数据存储文件夹</label>
                            <input type="text" class="character-creator__form-input" name="dataFolder" 
                                   value="${this.settings.dataFolder || 'character-creator'}" 
                                   placeholder="character-creator">
                            <p class="character-creator__form-desc">角色数据存储的文件夹路径（相对于仓库根目录）</p>
                        </div>
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">图片存储文件夹</label>
                            <input type="text" class="character-creator__form-input" name="imageFolder" 
                                   value="${this.settings.imageFolder || 'character-images'}" 
                                   placeholder="character-images">
                            <p class="character-creator__form-desc">角色图片存储的文件夹路径（相对于仓库根目录）</p>
                        </div>
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">保存配置</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#configurationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            this.settings.dataFolder = formData.get('dataFolder') || 'character-creator';
            this.settings.imageFolder = formData.get('imageFolder') || 'character-images';

            await this.saveSettings();
            new Notice('配置保存成功');
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    onunload() {
        console.log('角色设定器插件已卸载');
    }

    showFilePathModal() {
        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">设置文件保存路径</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="filePathForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">数据存储文件夹</label>
                            <input type="text" class="character-creator__form-input" name="dataFolder" 
                                   value="${this.settings.dataFolder || 'character-creator'}" 
                                   placeholder="character-creator">
                            <p class="character-creator__form-desc">角色数据存储的文件夹路径（相对于仓库根目录）</p>
                        </div>
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">图片存储文件夹</label>
                            <input type="text" class="character-creator__form-input" name="imageFolder" 
                                   value="${this.settings.imageFolder || 'character-creator/character-images'}" 
                                   placeholder="character-creator/character-images">
                            <p class="character-creator__form-desc">角色图片存储的文件夹路径（将自动创建图片索引文件）</p>
                        </div>
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">保存设置</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#filePathForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            this.settings.dataFolder = formData.get('dataFolder') || 'character-creator';
            this.settings.imageFolder = formData.get('imageFolder') || 'character-creator/character-images';

            await this.saveSettings();
            new Notice('文件路径设置保存成功');
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async loadSettings() {
        const defaultSettings = {
            displayName: '角色设定器',
            dataFolder: 'character-creator',
            imageFolder: 'character-creator/character-images',
            autoBackup: true,
            backupInterval: 7, // 天
            maxBackups: 10
        };

        const savedSettings = await this.loadData();
        this.settings = Object.assign({}, defaultSettings, savedSettings);
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf = workspace.getLeavesOfType(CHARACTER_CREATOR_VIEW_TYPE)[0];

        if (!leaf) {
            // 在中间打开，而不是右侧
            leaf = workspace.getLeaf('tab');
            await leaf.setViewState({
                type: CHARACTER_CREATOR_VIEW_TYPE,
                active: true,
            });
        }

        workspace.revealLeaf(leaf);
    }
}


// 添加Setting类的定义（因为Obsidian可能没有导出这个类）
class Setting {
    constructor(containerEl) {
        this.containerEl = containerEl;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setDesc(desc) {
        this.desc = desc;
        return this;
    }

    addText(callback) {
        const text = {
            setPlaceholder: (placeholder) => this,
            setValue: (value) => this,
            onChange: (callback) => this
        };
        callback(text);
        return this;
    }

    addToggle(callback) {
        const toggle = {
            setValue: (value) => this,
            onChange: (callback) => this
        };
        callback(toggle);
        return this;
    }

    addSlider(callback) {
        const slider = {
            setLimits: (min, max, step) => this,
            setValue: (value) => this,
            setDynamicTooltip: () => this,
            onChange: (callback) => this
        };
        callback(slider);
        return this;
    }

    addButton(callback) {
        const button = {
            setButtonText: (text) => this,
            onClick: (callback) => this
        };
        callback(button);
        return this;
    }
}

class CharacterCreator {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.pages = [];
        this.currentPageId = null;
        this.currentView = 'card';
        this.plugin = null;
        this.initPlugin();
    }

    initPlugin() {
        try {
            this.plugin = this.app.plugins.plugins['obsidian-character-creator'];
        } catch (error) {
            console.error('无法获取插件实例:', error);
        }
    }

    init() {
        this.loadData();
        this.render();
        this.bindEvents();
    }

    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    async loadData() {
        try {
            // 确保插件已初始化
            if (!this.plugin) {
                this.initPlugin();
            }

            const dataFolder = this.plugin && this.plugin.settings ? this.plugin.settings.dataFolder : 'character-creator';

            await this.ensureFolderExists(dataFolder);

            const indexFile = `${dataFolder}/pages-index.json`;
            const indexData = await this.app.vault.adapter.read(indexFile);
            const pageIds = JSON.parse(indexData);

            this.pages = [];
            for (const pageId of pageIds) {
                const pageFile = `${dataFolder}/page-${pageId}.json`;
                const pageData = await this.app.vault.adapter.read(pageFile);
                this.pages.push(JSON.parse(pageData));
            }

            if (this.pages.length > 0) {
                this.currentPageId = this.pages[0].id;
            } else {
                await this.createDefaultPage();
            }
        } catch (error) {
            // 如果文件不存在，创建默认数据
            await this.createDefaultPage();
        }
    }

    async createDefaultPage() {
        const defaultPage = {
            id: Date.now(),
            name: '默认页面',
            characters: [
                {
                    id: 1,
                    name: '艾莉娅',
                    description: '一位勇敢的女战士，擅长剑术和魔法。',
                    age: 25,
                    race: '人类',
                    class: '战士',
                    tags: ['勇敢', '正义', '剑术'],
                    image: '👸',
                    images: [],
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: '雷克斯',
                    description: '神秘的魔法师，掌握着古老的魔法知识。',
                    age: 35,
                    race: '精灵',
                    class: '法师',
                    tags: ['神秘', '智慧', '魔法'],
                    image: '🧙‍♂️',
                    images: [],
                    createdAt: new Date().toISOString()
                }
            ],
            template: {
                fields: [
                    { name: '年龄', type: 'number', value: 25, required: true },
                    { name: '种族', type: 'select', value: '人类', options: ['人类', '精灵', '矮人', '半身人', '兽人'], required: true },
                    { name: '职业', type: 'select', value: '战士', options: ['战士', '法师', '盗贼', '牧师', '游侠'], required: true },
                    { name: '标签', type: 'tags', value: ['勇敢', '正义'], required: false },
                    { name: '描述', type: 'textarea', value: '请输入角色描述...', required: true }
                ]
            }
        };

        this.pages = [defaultPage];
        this.currentPageId = defaultPage.id;
        await this.savePage(defaultPage);
        await this.updatePagesIndex();
    }

    async savePage(page) {
        const dataFolder = this.plugin && this.plugin.settings ? this.plugin.settings.dataFolder : 'character-creator';
        const pageFile = `${dataFolder}/page-${page.id}.json`;
        await this.app.vault.adapter.write(pageFile, JSON.stringify(page, null, 2));
    }

    async updatePagesIndex() {
        const dataFolder = this.plugin && this.plugin.settings ? this.plugin.settings.dataFolder : 'character-creator';
        const indexFile = `${dataFolder}/pages-index.json`;
        const pageIds = this.pages.map(page => page.id);
        await this.app.vault.adapter.write(indexFile, JSON.stringify(pageIds, null, 2));
    }

    async ensureFolderExists(folderPath) {
        try {
            await this.app.vault.createFolder(folderPath);
        } catch (error) {
            // 文件夹可能已存在，忽略错误
        }
    }

    getCurrentPage() {
        return this.pages.find(page => page.id === this.currentPageId);
    }

    getCurrentCharacters() {
        const currentPage = this.getCurrentPage();
        return currentPage ? currentPage.characters : [];
    }

    render() {
        const displayName = this.plugin && this.plugin.settings ? this.plugin.settings.displayName : '角色设定器';

        this.container.innerHTML = `
            <div class="character-creator">
                <div class="character-creator__header">
                    <h1 class="character-creator__title">${displayName}</h1>
                    <div class="character-creator__controls">
                        <div class="character-creator__search">
                            <input type="text" class="character-creator__search-input" id="searchInput" placeholder="搜索角色...">
                        </div>
                        <div class="character-creator__view-toggle">
                            <button class="character-creator__view-button ${this.currentView === 'list' ? 'active' : ''}" data-view="list">列表</button>
                            <button class="character-creator__view-button ${this.currentView === 'card' ? 'active' : ''}" data-view="card">卡片</button>
                            <button class="character-creator__view-button ${this.currentView === 'grid' ? 'active' : ''}" data-view="grid">网格</button>
                        </div>
                        <button class="character-creator__add-button" id="addCharacterBtn">添加角色</button>
                    </div>
                </div>
                <div class="character-creator__tabs">
                    ${this.renderTabs()}
                </div>
                <div class="character-creator__content">
                    ${this.renderContent()}
                </div>
            </div>
        `;
    }

    renderTabs() {
        return `
            <div class="character-creator__tab-container">
                <div class="character-creator__tab-list">
                    ${this.pages.map(page => `
                        <button class="character-creator__tab ${page.id === this.currentPageId ? 'active' : ''}" data-page-id="${page.id}">
                            ${page.name}
                            <span class="character-creator__tab-close" data-page-id="${page.id}">&times;</span>
                        </button>
                    `).join('')}
                </div>
                <button class="character-creator__tab-add" id="addPageBtn">+</button>
            </div>
        `;
    }

    renderContent() {
        const characters = this.getCurrentCharacters();

        if (characters.length === 0) {
            return this.renderEmptyState();
        }

        if (this.currentView === 'list') {
            return this.renderListView(characters);
        } else if (this.currentView === 'card') {
            return this.renderCardView(characters);
        } else if (this.currentView === 'grid') {
            return this.renderGridView(characters);
        }
    }

    renderCardView(characters) {
        return `
            <div class="character-creator__grid">
                ${characters.map(character => `
                    <div class="character-creator__grid-item" data-id="${character.id}">
                        <div class="character-creator__grid-image">
                            ${this.renderCharacterImage(character)}
                        </div>
                        <div class="character-creator__grid-content">
                            <h3 class="character-creator__grid-title">${character.name}</h3>
                            ${this.renderCharacterCardContent(character)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderGridView(characters) {
        return `
            <div class="character-creator__grid character-creator__grid--compact">
                ${characters.map(character => `
                    <div class="character-creator__grid-item character-creator__grid-item--compact" data-id="${character.id}">
                        <div class="character-creator__grid-image character-creator__grid-image--compact">
                            ${this.renderCharacterImage(character)}
                        </div>
                        <div class="character-creator__grid-content character-creator__grid-content--compact">
                            <h3 class="character-creator__grid-title character-creator__grid-title--compact">${character.name}</h3>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderListView(characters) {
        return `
            <div class="character-creator__list">
                ${characters.map(character => `
                    <div class="character-creator__list-item" data-id="${character.id}">
                        <div class="character-creator__list-header">
                            <h3 class="character-creator__list-title">${character.name}</h3>
                            <div class="character-creator__list-meta">
                                ${this.renderCharacterListMeta(character)}
                            </div>
                        </div>
                        ${this.renderCharacterListContent(character)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCharacterCardContent(character) {
        const currentPage = this.getCurrentPage();
        if (!currentPage || !currentPage.template || !currentPage.template.fields) {
            return `<p class="character-creator__grid-description">暂无描述</p>`;
        }

        // 查找描述字段
        const descriptionField = currentPage.template.fields.find(field =>
            field.type === 'textarea' || field.name.toLowerCase().includes('描述')
        );

        // 查找标签字段
        const tagsField = currentPage.template.fields.find(field =>
            field.type === 'tags' || field.name.toLowerCase().includes('标签')
        );

        let content = '';

        // 添加描述
        if (descriptionField && character[descriptionField.name]) {
            content += `<p class="character-creator__grid-description">${character[descriptionField.name]}</p>`;
        }

        // 添加标签
        if (tagsField && character[tagsField.name]) {
            const tags = Array.isArray(character[tagsField.name]) ? character[tagsField.name] : character[tagsField.name].split(',').map(tag => tag.trim());
            content += `<div class="character-creator__grid-tags">${tags.map(tag => `<span class="character-creator__tag">${tag}</span>`).join('')}</div>`;
        }

        return content || `<p class="character-creator__grid-description">暂无描述</p>`;
    }

    renderCharacterListMeta(character) {
        const currentPage = this.getCurrentPage();
        if (!currentPage || !currentPage.template || !currentPage.template.fields) {
            return '';
        }

        const metaFields = currentPage.template.fields.filter(field =>
            field.type === 'number' || field.type === 'select'
        ).slice(0, 3); // 最多显示3个字段

        return metaFields.map(field => {
            const value = character[field.name] || field.value || '';
            if (field.type === 'number') {
                return `<span>${value}</span>`;
            } else {
                return `<span>${value}</span>`;
            }
        }).join('');
    }

    renderCharacterListContent(character) {
        const currentPage = this.getCurrentPage();
        if (!currentPage || !currentPage.template || !currentPage.template.fields) {
            return `<p class="character-creator__list-description">暂无描述</p>`;
        }

        // 查找描述字段
        const descriptionField = currentPage.template.fields.find(field =>
            field.type === 'textarea' || field.name.toLowerCase().includes('描述')
        );

        // 查找标签字段
        const tagsField = currentPage.template.fields.find(field =>
            field.type === 'tags' || field.name.toLowerCase().includes('标签')
        );

        let content = '';

        // 添加描述
        if (descriptionField && character[descriptionField.name]) {
            content += `<p class="character-creator__list-description">${character[descriptionField.name]}</p>`;
        }

        // 添加标签
        if (tagsField && character[tagsField.name]) {
            const tags = Array.isArray(character[tagsField.name]) ? character[tagsField.name] : character[tagsField.name].split(',').map(tag => tag.trim());
            content += `<div class="character-creator__list-tags">${tags.map(tag => `<span class="character-creator__tag">${tag}</span>`).join('')}</div>`;
        }

        return content || `<p class="character-creator__list-description">暂无描述</p>`;
    }

    renderCharacterImage(character) {
        if (character.images && character.images.length > 0) {
            const firstImage = character.images[0];
            // 使用Obsidian的资源URL
            const imageUrl = this.app.vault.adapter.getResourcePath(firstImage);
            return `<img src="${imageUrl}" alt="${character.name}" class="character-creator__grid-thumbnail">`;
        } else {
            return `<div class="character-creator__grid-emoji">${character.image}</div>`;
        }
    }

    renderEmptyState() {
        return `
            <div class="character-creator__empty">
                <div class="character-creator__empty-icon">👥</div>
                <h2 class="character-creator__empty-title">还没有角色</h2>
                <p class="character-creator__empty-description">点击"添加角色"开始创建你的第一个角色设定</p>
            </div>
        `;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.character-creator__view-button')) {
                const button = e.target.closest('.character-creator__view-button');
                const view = button.dataset.view;
                this.switchView(view);
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.closest('#addCharacterBtn')) {
                this.showAddCharacterModal();
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.closest('#addPageBtn')) {
                this.showAddPageModal();
            }
        });

        this.container.addEventListener('click', (e) => {
            const tab = e.target.closest('.character-creator__tab');
            if (tab && !e.target.closest('.character-creator__tab-close')) {
                const pageId = parseInt(tab.dataset.pageId);
                this.switchPage(pageId);
            }
        });

        // 添加右键菜单事件
        this.container.addEventListener('contextmenu', (e) => {
            const tab = e.target.closest('.character-creator__tab');
            if (tab && !e.target.closest('.character-creator__tab-close')) {
                e.preventDefault();
                const pageId = parseInt(tab.dataset.pageId);
                this.showPageContextMenu(e, pageId);
            }
        });

        this.container.addEventListener('click', (e) => {
            const closeBtn = e.target.closest('.character-creator__tab-close');
            if (closeBtn) {
                const pageId = parseInt(closeBtn.dataset.pageId);
                this.deletePage(pageId);
            }
        });

        this.container.addEventListener('click', (e) => {
            const item = e.target.closest('.character-creator__grid-item, .character-creator__list-item');
            if (item) {
                const id = parseInt(item.dataset.id);
                this.showCharacterDetail(id);
            }
        });

        // 搜索功能
        this.container.addEventListener('input', (e) => {
            if (e.target.id === 'searchInput') {
                this.performSearch(e.target.value);
            }
        });
    }

    switchView(view) {
        this.currentView = view;
        this.render();
    }

    async switchPage(pageId) {
        this.currentPageId = pageId;
        this.render();
    }

    async showAddPageModal() {
        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">添加新页面</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="addPageForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">页面名称</label>
                            <input type="text" class="character-creator__form-input" name="name" required placeholder="输入页面名称">
                        </div>
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">创建</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#addPageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addPage(new FormData(e.target));
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async showPageSettings(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        // 确保页面有模板设置
        if (!page.template) {
            page.template = {
                fields: [
                    { name: '年龄', type: 'number', value: 25, required: true },
                    { name: '种族', type: 'select', value: '人类', options: ['人类', '精灵', '矮人', '半身人', '兽人'], required: true },
                    { name: '职业', type: 'select', value: '战士', options: ['战士', '法师', '盗贼', '牧师', '游侠'], required: true },
                    { name: '标签', type: 'tags', value: ['勇敢', '正义'], required: false },
                    { name: '描述', type: 'textarea', value: '请输入角色描述...', required: true }
                ]
            };
        }

        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content character-creator__modal-content--large">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">页面设置 - ${page.name}</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="pageSettingsForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">页面名称</label>
                            <input type="text" class="character-creator__form-input" name="pageName" value="${page.name}" required>
                        </div>
                        
                        <div class="character-creator__form-section">
                            <h3>角色字段配置</h3>
                            <p class="character-creator__form-desc">配置角色创建表单中显示的字段</p>
                        </div>
                        
                        <div id="templateFieldsContainer">
                            ${this.renderTemplateFieldsEditor(page.template.fields)}
                        </div>
                        
                        <div class="character-creator__form-group">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="addFieldBtn">添加字段</button>
                        </div>
                        
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">保存设置</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#pageSettingsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            // 更新页面名称
            page.name = formData.get('pageName').trim();

            // 收集模板字段数据
            const fields = [];
            const fieldElements = modal.querySelectorAll('.character-creator__template-field');

            fieldElements.forEach((fieldElement, index) => {
                const fieldName = fieldElement.querySelector('[name="fieldName"]').value;
                const fieldType = fieldElement.querySelector('[name="fieldType"]').value;
                const fieldRequired = fieldElement.querySelector('[name="fieldRequired"]').checked;
                let fieldValue = '';
                let fieldOptions = [];

                if (fieldType === 'select') {
                    fieldOptions = fieldElement.querySelector('[name="fieldOptions"]').value.split(',').map(opt => opt.trim()).filter(opt => opt);
                    fieldValue = fieldOptions[0] || '';
                } else if (fieldType === 'tags') {
                    fieldValue = fieldElement.querySelector('[name="fieldValue"]').value.split(',').map(tag => tag.trim()).filter(tag => tag);
                } else if (fieldType === 'textarea') {
                    fieldValue = fieldElement.querySelector('[name="fieldValue"]').value;
                } else {
                    fieldValue = fieldElement.querySelector('[name="fieldValue"]').value;
                }

                fields.push({
                    name: fieldName,
                    type: fieldType,
                    value: fieldValue,
                    options: fieldOptions,
                    required: fieldRequired
                });
            });

            // 更新模板设置
            page.template = { fields };

            await this.savePage(page);
            this.render();
            new Notice('页面设置保存成功');
            modal.remove();
        });

        // 添加字段按钮事件
        modal.querySelector('#addFieldBtn').addEventListener('click', () => {
            this.addTemplateField(modal, page);
        });

        // 添加删除字段按钮事件
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('character-creator__remove-field-btn')) {
                e.target.closest('.character-creator__template-field').remove();
            }
        });

        // 添加字段类型变化事件
        modal.addEventListener('change', (e) => {
            if (e.target.name === 'fieldType') {
                const fieldElement = e.target.closest('.character-creator__template-field');
                const fieldIndex = fieldElement.getAttribute('data-index');
                const newType = e.target.value;

                const newField = {
                    name: fieldElement.querySelector('[name="fieldName"]').value,
                    type: newType,
                    value: '',
                    options: [],
                    required: fieldElement.querySelector('[name="fieldRequired"]').checked
                };

                const contentElement = fieldElement.querySelector('.character-creator__template-field-content');
                contentElement.innerHTML = this.renderFieldEditor(newField, fieldIndex);
            }
        });

        // 添加关闭确认
        const originalClose = modal.querySelector('.character-creator__modal-close').onclick;
        modal.querySelector('.character-creator__modal-close').onclick = () => {
            if (confirm('是否保存页面设置？')) {
                modal.querySelector('#pageSettingsForm').dispatchEvent(new Event('submit'));
            } else {
                modal.remove();
            }
        };

        // 添加点击外部关闭确认
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (confirm('是否保存页面设置？')) {
                    modal.querySelector('#pageSettingsForm').dispatchEvent(new Event('submit'));
                } else {
                    modal.remove();
                }
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async addPage(formData) {
        const newPage = {
            id: Date.now(),
            name: formData.get('name'),
            characters: [],
            template: {
                fields: [
                    { name: '年龄', type: 'number', value: 25, required: true },
                    { name: '种族', type: 'select', value: '人类', options: ['人类', '精灵', '矮人', '半身人', '兽人'], required: true },
                    { name: '职业', type: 'select', value: '战士', options: ['战士', '法师', '盗贼', '牧师', '游侠'], required: true },
                    { name: '标签', type: 'tags', value: ['勇敢', '正义'], required: false },
                    { name: '描述', type: 'textarea', value: '请输入角色描述...', required: true }
                ]
            }
        };

        this.pages.push(newPage);
        this.currentPageId = newPage.id;
        await this.savePage(newPage);
        await this.updatePagesIndex();
        this.render();
        new Notice('页面创建成功');
    }

    showPageContextMenu(e, pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        const menu = document.createElement('div');
        menu.className = 'character-creator__context-menu';
        menu.innerHTML = `
            <div class="character-creator__context-menu-item" data-action="rename">
                <span>重命名页面</span>
            </div>
            <div class="character-creator__context-menu-item" data-action="settings">
                <span>页面设置</span>
            </div>
            <div class="character-creator__context-menu-separator"></div>
            <div class="character-creator__context-menu-item character-creator__context-menu-item--danger" data-action="delete">
                <span>删除页面</span>
            </div>
        `;

        // 定位菜单
        menu.style.position = 'fixed';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.style.zIndex = '1000';

        document.body.appendChild(menu);

        // 绑定菜单事件
        menu.addEventListener('click', async (e) => {
            const action = e.target.closest('.character-creator__context-menu-item')?.dataset.action;
            if (!action) return;

            menu.remove();

            switch (action) {
                case 'rename':
                    await this.renamePage(pageId);
                    break;
                case 'settings':
                    await this.showPageSettings(pageId);
                    break;
                case 'delete':
                    await this.deletePage(pageId);
                    break;
            }
        });

        // 点击其他地方关闭菜单
        const closeMenu = () => {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        };
        document.addEventListener('click', closeMenu);
    }

    async renamePage(pageId) {
        const page = this.pages.find(p => p.id === pageId);
        if (!page) return;

        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">重命名页面</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="renamePageForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">页面名称</label>
                            <input type="text" class="character-creator__form-input" name="name" value="${page.name}" required>
                        </div>
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#renamePageForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = e.target.name.value.trim();
            if (newName) {
                page.name = newName;
                await this.savePage(page);
                this.render();
                new Notice('页面重命名成功');
            }
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async deletePage(pageId) {
        if (this.pages.length <= 1) {
            new Notice('至少需要保留一个页面');
            return;
        }

        if (confirm('确定要删除这个页面吗？页面中的所有角色也会被删除。')) {
            const dataFolder = this.plugin && this.plugin.settings ? this.plugin.settings.dataFolder : 'character-creator';
            const pageFile = `${dataFolder}/page-${pageId}.json`;
            try {
                await this.app.vault.adapter.remove(pageFile);
            } catch (error) {
                console.error('删除页面文件失败:', error);
            }

            this.pages = this.pages.filter(page => page.id !== pageId);

            if (this.currentPageId === pageId) {
                this.currentPageId = this.pages[0].id;
            }

            await this.updatePagesIndex();
            this.render();
            new Notice('页面删除成功');
        }
    }

    async showAddCharacterModal() {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        // 确保页面有模板设置
        if (!currentPage.template) {
            currentPage.template = {
                fields: [
                    { name: '年龄', type: 'number', value: 25, required: true },
                    { name: '种族', type: 'select', value: '人类', options: ['人类', '精灵', '矮人', '半身人', '兽人'], required: true },
                    { name: '职业', type: 'select', value: '战士', options: ['战士', '法师', '盗贼', '牧师', '游侠'], required: true },
                    { name: '标签', type: 'tags', value: ['勇敢', '正义'], required: false },
                    { name: '描述', type: 'textarea', value: '请输入角色描述...', required: true }
                ]
            };
        }

        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">添加新角色</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="addCharacterForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">角色名称</label>
                            <input type="text" class="character-creator__form-input" name="name" required>
                        </div>
                        ${this.renderTemplateFields(currentPage.template.fields)}
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#addCharacterForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addCharacter(new FormData(e.target));
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async addCharacter(formData) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const character = {
            id: Date.now(),
            name: formData.get('name'),
            image: this.getRandomEmoji(),
            images: [],
            createdAt: new Date().toISOString()
        };

        // 处理动态字段
        if (currentPage.template && currentPage.template.fields) {
            currentPage.template.fields.forEach(field => {
                const value = formData.get(field.name);
                if (field.type === 'number') {
                    character[field.name] = parseInt(value) || 0;
                } else if (field.type === 'tags') {
                    character[field.name] = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                } else if (field.type === 'textarea') {
                    character[field.name] = value || '';
                } else {
                    character[field.name] = value || '';
                }
            });
        }

        currentPage.characters.unshift(character);
        await this.savePage(currentPage);
        this.render();
        new Notice('角色添加成功');
    }

    async showCharacterDetail(id) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const character = currentPage.characters.find(c => c.id === id);
        if (!character) return;

        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content character-creator__modal-content--large">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">${character.name}</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    ${this.renderCharacterDetailFields(character)}
                    <div class="character-creator__form-group">
                        <label class="character-creator__form-label">图片</label>
                        <div class="character-creator__image-gallery" id="imageGalleryContainer">
                            ${this.renderImageGallery(character)}
                        </div>
                        <div class="character-creator__image-actions">
                            <button class="character-creator__btn character-creator__btn--secondary" id="addImageBtn">添加图片</button>
                            <button class="character-creator__btn character-creator__btn--secondary" id="setImagePathBtn">设置图片路径</button>
                        </div>
                    </div>
                    <div class="character-creator__form-actions">
                        <button class="character-creator__btn character-creator__btn--primary" id="editBtn">编辑角色</button>
                        <button class="character-creator__btn character-creator__btn--danger" id="deleteBtn">删除角色</button>
                        <button class="character-creator__btn character-creator__btn--secondary" id="closeBtn">关闭</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#closeBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#editBtn').addEventListener('click', () => {
            this.showEditCharacterModal(character);
            modal.remove();
        });

        modal.querySelector('#deleteBtn').addEventListener('click', async () => {
            if (confirm('确定要删除这个角色吗？')) {
                await this.deleteCharacter(id);
                modal.remove();
            }
        });

        modal.querySelector('#addImageBtn').addEventListener('click', async () => {
            await this.addImageToCharacter(character);
            // 直接更新当前模态框中的图片画廊，而不是重新创建界面
            this.updateImageGallery(modal, character);
        });

        modal.querySelector('#setImagePathBtn').addEventListener('click', () => {
            this.plugin.showFilePathModal();
        });

        // 绑定图片拖拽和删除事件
        this.bindImageEvents(modal, character);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    renderImageGallery(character) {
        if (!character.images || character.images.length === 0) {
            return '<p class="character-creator__no-images">暂无图片</p>';
        }

        return `
            <div class="character-creator__image-grid" data-character-id="${character.id}">
                ${character.images.map((image, index) => {
            const imageUrl = this.app.vault.adapter.getResourcePath(image);
            return `
                        <div class="character-creator__image-item" draggable="true" data-index="${index}">
                            <img src="${imageUrl}" alt="角色图片 ${index + 1}" class="character-creator__gallery-image">
                            <button class="character-creator__image-remove" data-index="${index}">&times;</button>
                            <div class="character-creator__image-drag-handle">⋮⋮</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    async addImageToCharacter(character) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;

        input.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);

            for (const file of files) {
                try {
                    const imagePath = await this.saveImageToVault(file);
                    character.images.push(imagePath);
                } catch (error) {
                    console.error('保存图片失败:', error);
                    new Notice('保存图片失败');
                }
            }

            const currentPage = this.getCurrentPage();
            if (currentPage) {
                await this.savePage(currentPage);
            }
            this.render();
            new Notice(`成功添加 ${files.length} 张图片`);
        });

        input.click();
    }

    async saveImageToVault(file) {
        const imageFolder = this.plugin && this.plugin.settings ? this.plugin.settings.imageFolder : 'character-creator/character-images';
        await this.ensureFolderExists(imageFolder);

        // 自动重命名图片文件
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const newFileName = `character-image-${timestamp}.${fileExtension}`;
        const filePath = `${imageFolder}/${newFileName}`;

        // 保存图片文件
        const arrayBuffer = await file.arrayBuffer();
        await this.app.vault.createBinary(filePath, arrayBuffer);

        // 更新图片索引文件
        await this.updateImageIndex(filePath, file.name);

        return filePath;
    }

    async updateImageIndex(imagePath, originalFileName) {
        const imageFolder = this.plugin && this.plugin.settings ? this.plugin.settings.imageFolder : 'character-creator/character-images';
        const indexFilePath = `${imageFolder}/image-index.md`;

        try {
            // 确保图片文件夹存在
            await this.ensureFolderExists(imageFolder);

            // 尝试读取现有的索引文件
            let indexContent = '';
            try {
                indexContent = await this.app.vault.adapter.read(indexFilePath);
            } catch (error) {
                // 文件不存在，创建新的索引文件
                indexContent = `# 角色图片索引

此文件用于记录角色设定器中使用的所有图片文件。

## 图片列表

`;
            }

            // 添加新的图片记录
            const timestamp = new Date().toISOString();
            const newEntry = `- **${originalFileName}** → [[${imagePath}]] (添加时间: ${timestamp})\n`;

            // 在图片列表部分添加新条目
            const lines = indexContent.split('\n');
            const insertIndex = lines.findIndex(line => line.includes('## 图片列表'));
            if (insertIndex !== -1) {
                lines.splice(insertIndex + 2, 0, newEntry);
            } else {
                lines.push(newEntry);
            }

            // 保存更新后的索引文件
            await this.app.vault.adapter.write(indexFilePath, lines.join('\n'));

        } catch (error) {
            console.error('更新图片索引失败:', error);
        }
    }

    async showEditCharacterModal(character) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const modal = document.createElement('div');
        modal.className = 'character-creator__modal';
        modal.innerHTML = `
            <div class="character-creator__modal-content">
                <div class="character-creator__modal-header">
                    <h2 class="character-creator__modal-title">编辑角色</h2>
                    <button class="character-creator__modal-close">&times;</button>
                </div>
                <div class="character-creator__modal-body">
                    <form id="editCharacterForm">
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">角色名称</label>
                            <input type="text" class="character-creator__form-input" name="name" value="${character.name}" required>
                        </div>
                        ${this.renderTemplateFieldsForEdit(currentPage.template.fields, character)}
                        <div class="character-creator__form-actions">
                            <button type="button" class="character-creator__btn character-creator__btn--secondary" id="cancelBtn">取消</button>
                            <button type="submit" class="character-creator__btn character-creator__btn--primary">保存</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.character-creator__modal-close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#cancelBtn').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('#editCharacterForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.updateCharacter(character.id, new FormData(e.target));
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async updateCharacter(id, formData) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        const characterIndex = currentPage.characters.findIndex(c => c.id === id);
        if (characterIndex === -1) return;

        const updatedCharacter = {
            ...currentPage.characters[characterIndex],
            name: formData.get('name'),
            updatedAt: new Date().toISOString()
        };

        // 处理动态字段
        if (currentPage.template && currentPage.template.fields) {
            currentPage.template.fields.forEach(field => {
                const value = formData.get(field.name);
                if (field.type === 'number') {
                    updatedCharacter[field.name] = parseInt(value) || 0;
                } else if (field.type === 'tags') {
                    updatedCharacter[field.name] = value ? value.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
                } else if (field.type === 'textarea') {
                    updatedCharacter[field.name] = value || '';
                } else {
                    updatedCharacter[field.name] = value || '';
                }
            });
        }

        currentPage.characters[characterIndex] = updatedCharacter;
        await this.savePage(currentPage);
        this.render();
        new Notice('角色更新成功');
    }

    async deleteCharacter(id) {
        const currentPage = this.getCurrentPage();
        if (!currentPage) return;

        currentPage.characters = currentPage.characters.filter(c => c.id !== id);
        await this.savePage(currentPage);
        this.render();
        new Notice('角色删除成功');
    }

    bindImageEvents(modal, character) {
        const imageGrid = modal.querySelector('.character-creator__image-grid');
        if (!imageGrid) return;

        // 删除图片事件
        imageGrid.addEventListener('click', async (e) => {
            const removeBtn = e.target.closest('.character-creator__image-remove');
            if (removeBtn) {
                const index = parseInt(removeBtn.dataset.index);
                if (confirm('确定要删除这张图片吗？')) {
                    await this.removeImageFromCharacter(character, index);
                    // 直接更新当前模态框中的图片画廊
                    this.updateImageGallery(modal, character);
                }
            }
        });

        // 拖拽排序事件
        let draggedElement = null;

        imageGrid.addEventListener('dragstart', (e) => {
            const imageItem = e.target.closest('.character-creator__image-item');
            if (imageItem) {
                draggedElement = imageItem;
                e.dataTransfer.effectAllowed = 'move';
                imageItem.classList.add('dragging');
            }
        });

        imageGrid.addEventListener('dragend', (e) => {
            const imageItem = e.target.closest('.character-creator__image-item');
            if (imageItem) {
                imageItem.classList.remove('dragging');
                draggedElement = null;
            }
        });

        imageGrid.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        imageGrid.addEventListener('drop', async (e) => {
            e.preventDefault();
            if (!draggedElement) return;

            const targetItem = e.target.closest('.character-creator__image-item');
            if (!targetItem || targetItem === draggedElement) return;

            const fromIndex = parseInt(draggedElement.dataset.index);
            const toIndex = parseInt(targetItem.dataset.index);

            await this.reorderImages(character, fromIndex, toIndex);
            // 直接更新当前模态框中的图片画廊
            this.updateImageGallery(modal, character);
        });
    }

    async removeImageFromCharacter(character, index) {
        if (!character.images || index >= character.images.length) return;

        const imagePath = character.images[index];
        character.images.splice(index, 1);

        // 删除文件系统中的图片文件
        try {
            await this.app.vault.adapter.remove(imagePath);
        } catch (error) {
            console.error('删除图片文件失败:', error);
        }

        const currentPage = this.getCurrentPage();
        if (currentPage) {
            await this.savePage(currentPage);
        }
        new Notice('图片删除成功');
    }

    updateImageGallery(modal, character) {
        // 找到图片画廊容器
        const imageGalleryContainer = modal.querySelector('#imageGalleryContainer');
        if (!imageGalleryContainer) return;

        // 更新图片画廊内容
        imageGalleryContainer.innerHTML = this.renderImageGallery(character);

        // 重新绑定图片事件
        this.bindImageEvents(modal, character);
    }

    async reorderImages(character, fromIndex, toIndex) {
        if (!character.images || fromIndex === toIndex) return;

        const image = character.images.splice(fromIndex, 1)[0];
        character.images.splice(toIndex, 0, image);

        const currentPage = this.getCurrentPage();
        if (currentPage) {
            await this.savePage(currentPage);
        }
        new Notice('图片顺序已更新');
    }

    renderTemplateFields(fields) {
        return fields.map(field => {
            switch (field.type) {
                case 'number':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <input type="number" class="character-creator__form-input" name="${field.name}" value="${field.value}" min="1" max="200" ${field.required ? 'required' : ''}>
                        </div>
                    `;
                case 'select':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <select class="character-creator__form-input" name="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="">选择${field.name}</option>
                                ${field.options.map(option => `
                                    <option value="${option}" ${field.value === option ? 'selected' : ''}>${option}</option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                case 'tags':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}（用逗号分隔）</label>
                            <input type="text" class="character-creator__form-input" name="${field.name}" value="${Array.isArray(field.value) ? field.value.join(', ') : field.value}" placeholder="勇敢,正义,剑术" ${field.required ? 'required' : ''}>
                        </div>
                    `;
                case 'textarea':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <textarea class="character-creator__form-textarea" name="${field.name}" rows="4" ${field.required ? 'required' : ''}>${field.value}</textarea>
                        </div>
                    `;
                default:
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <input type="text" class="character-creator__form-input" name="${field.name}" value="${field.value}" ${field.required ? 'required' : ''}>
                        </div>
                    `;
            }
        }).join('');
    }

    renderCharacterDetailFields(character) {
        const currentPage = this.getCurrentPage();
        if (!currentPage || !currentPage.template || !currentPage.template.fields) {
            return `
                <div class="character-creator__form-group">
                    <label class="character-creator__form-label">角色信息</label>
                    <p>暂无字段配置</p>
                </div>
            `;
        }

        return currentPage.template.fields.map(field => {
            const characterValue = character[field.name] || field.value || '';

            switch (field.type) {
                case 'number':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <p>${characterValue}</p>
                        </div>
                    `;
                case 'select':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <p>${characterValue}</p>
                        </div>
                    `;
                case 'tags':
                    const tags = Array.isArray(characterValue) ? characterValue : (characterValue ? characterValue.split(',').map(tag => tag.trim()) : []);
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <div>
                                ${tags.map(tag => `<span class="character-creator__tag">${tag}</span>`).join('')}
                            </div>
                        </div>
                    `;
                case 'textarea':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <p>${characterValue}</p>
                        </div>
                    `;
                default:
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <p>${characterValue}</p>
                        </div>
                    `;
            }
        }).join('');
    }

    renderTemplateFieldsForEdit(fields, character) {
        return fields.map(field => {
            const characterValue = character[field.name] || field.value;

            switch (field.type) {
                case 'number':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <input type="number" class="character-creator__form-input" name="${field.name}" value="${characterValue}" min="1" max="200" ${field.required ? 'required' : ''}>
                        </div>
                    `;
                case 'select':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <select class="character-creator__form-input" name="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="">选择${field.name}</option>
                                ${field.options.map(option => `
                                    <option value="${option}" ${characterValue === option ? 'selected' : ''}>${option}</option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                case 'tags':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}（用逗号分隔）</label>
                            <input type="text" class="character-creator__form-input" name="${field.name}" value="${Array.isArray(characterValue) ? characterValue.join(', ') : characterValue}" placeholder="勇敢,正义,剑术" ${field.required ? 'required' : ''}>
                        </div>
                    `;
                case 'textarea':
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <textarea class="character-creator__form-textarea" name="${field.name}" rows="4" ${field.required ? 'required' : ''}>${characterValue}</textarea>
                        </div>
                    `;
                default:
                    return `
                        <div class="character-creator__form-group">
                            <label class="character-creator__form-label">${field.name}</label>
                            <input type="text" class="character-creator__form-input" name="${field.name}" value="${characterValue}" ${field.required ? 'required' : ''}>
                        </div>
                    `;
            }
        }).join('');
    }

    renderTemplateFieldsEditor(fields) {
        return fields.map((field, index) => `
            <div class="character-creator__template-field" data-index="${index}">
                <div class="character-creator__template-field-header">
                    <input type="text" class="character-creator__form-input character-creator__form-input--small" 
                           name="fieldName" value="${field.name}" placeholder="字段名称">
                    <select class="character-creator__form-input character-creator__form-input--small" name="fieldType">
                        <option value="text" ${field.type === 'text' ? 'selected' : ''}>文本</option>
                        <option value="number" ${field.type === 'number' ? 'selected' : ''}>数字</option>
                        <option value="select" ${field.type === 'select' ? 'selected' : ''}>选择</option>
                        <option value="tags" ${field.type === 'tags' ? 'selected' : ''}>标签</option>
                        <option value="textarea" ${field.type === 'textarea' ? 'selected' : ''}>多行文本</option>
                    </select>
                    <label class="character-creator__checkbox-label">
                        <input type="checkbox" name="fieldRequired" ${field.required ? 'checked' : ''}>
                        必填
                    </label>
                    <button type="button" class="character-creator__btn character-creator__btn--danger character-creator__btn--small character-creator__remove-field-btn">删除</button>
                </div>
                <div class="character-creator__template-field-content">
                    ${this.renderFieldEditor(field, index)}
                </div>
            </div>
        `).join('');
    }

    renderFieldEditor(field, index) {
        switch (field.type) {
            case 'select':
                return `
                    <div class="character-creator__form-group">
                        <label class="character-creator__form-label">选项（用逗号分隔）</label>
                        <input type="text" class="character-creator__form-input" name="fieldOptions" 
                               value="${field.options ? field.options.join(', ') : ''}" placeholder="选项1,选项2,选项3">
                    </div>
                    <div class="character-creator__form-group">
                        <label class="character-creator__form-label">默认值</label>
                        <input type="text" class="character-creator__form-input" name="fieldValue" 
                               value="${field.value || ''}" placeholder="默认值">
                    </div>
                `;
            case 'tags':
                return `
                    <div class="character-creator__form-group">
                        <label class="character-creator__form-label">默认标签（用逗号分隔）</label>
                        <input type="text" class="character-creator__form-input" name="fieldValue" 
                               value="${Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}" placeholder="标签1,标签2">
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="character-creator__form-group">
                        <label class="character-creator__form-label">默认内容</label>
                        <textarea class="character-creator__form-textarea" name="fieldValue" rows="2" 
                                  placeholder="默认内容">${field.value || ''}</textarea>
                    </div>
                `;
            default:
                return `
                    <div class="character-creator__form-group">
                        <label class="character-creator__form-label">默认值</label>
                        <input type="text" class="character-creator__form-input" name="fieldValue" 
                               value="${field.value || ''}" placeholder="默认值">
                    </div>
                `;
        }
    }

    performSearch(query) {
        const characters = this.getCurrentCharacters();
        const searchQuery = query.toLowerCase().trim();

        if (!searchQuery) {
            // 清空搜索，显示所有角色
            this.render();
            return;
        }

        const filteredCharacters = characters.filter(character => {
            const searchFields = [
                character.name,
                character.description,
                character.race,
                character.class,
                character.tags.join(' '),
                character.age.toString()
            ].join(' ').toLowerCase();

            return searchFields.includes(searchQuery);
        });

        this.renderSearchResults(filteredCharacters, searchQuery);
    }

    renderSearchResults(characters, query) {
        const contentContainer = this.container.querySelector('.character-creator__content');
        if (!contentContainer) return;

        if (characters.length === 0) {
            contentContainer.innerHTML = `
                <div class="character-creator__empty">
                    <div class="character-creator__empty-icon">🔍</div>
                    <h2 class="character-creator__empty-title">未找到匹配的角色</h2>
                    <p class="character-creator__empty-description">搜索关键词: "${query}"</p>
                </div>
            `;
            return;
        }

        if (this.currentView === 'list') {
            contentContainer.innerHTML = this.renderListView(characters);
        } else if (this.currentView === 'card') {
            contentContainer.innerHTML = this.renderCardView(characters);
        } else if (this.currentView === 'grid') {
            contentContainer.innerHTML = this.renderGridView(characters);
        }

        // 高亮搜索关键词
        this.highlightSearchTerms(query);
    }

    highlightSearchTerms(query) {
        const searchTerms = query.split(' ').filter(term => term.length > 0);
        const textElements = this.container.querySelectorAll('.character-creator__grid-title, .character-creator__list-title, .character-creator__grid-description, .character-creator__list-description');

        textElements.forEach(element => {
            let text = element.textContent;
            searchTerms.forEach(term => {
                const regex = new RegExp(`(${term})`, 'gi');
                text = text.replace(regex, '<mark>$1</mark>');
            });
            element.innerHTML = text;
        });
    }

    addTemplateField(modal, page) {
        const container = modal.querySelector('#templateFieldsContainer');
        const fieldIndex = container.children.length;

        const newField = {
            name: '',
            type: 'text',
            value: '',
            options: [],
            required: false
        };

        const fieldHtml = `
            <div class="character-creator__template-field-header">
                <input type="text" class="character-creator__form-input character-creator__form-input--small" 
                       name="fieldName" value="" placeholder="字段名称">
                <select class="character-creator__form-input character-creator__form-input--small" name="fieldType">
                    <option value="text" selected>文本</option>
                    <option value="number">数字</option>
                    <option value="select">选择</option>
                    <option value="tags">标签</option>
                    <option value="textarea">多行文本</option>
                </select>
                <label class="character-creator__checkbox-label">
                    <input type="checkbox" name="fieldRequired">
                    必填
                </label>
                <button type="button" class="character-creator__btn character-creator__btn--danger character-creator__btn--small character-creator__remove-field-btn">删除</button>
            </div>
            <div class="character-creator__template-field-content">
                ${this.renderFieldEditor(newField, fieldIndex)}
            </div>
        `;

        const fieldElement = document.createElement('div');
        fieldElement.className = 'character-creator__template-field';
        fieldElement.setAttribute('data-index', fieldIndex);
        fieldElement.innerHTML = fieldHtml;

        container.appendChild(fieldElement);
    }

    removeTemplateField(pageId, fieldIndex) {
        const fieldElement = document.querySelector(`[data-page-id="${pageId}"][data-field-index="${fieldIndex}"]`);
        if (fieldElement) {
            fieldElement.remove();
        }
    }

    getRandomEmoji() {
        const emojis = ['👸', '🧙‍♂️', '🦹‍♀️', '🧝‍♀️', '🧙‍♀️', '👨‍⚔️', '👩‍⚔️', '🧝‍♂️'];
        return emojis[Math.floor(Math.random() * emojis.length)];
    }
}

module.exports = CharacterCreatorPlugin;

