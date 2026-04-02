// ===================================
// Nav Render (NAV_CONFIG 기반 단일 관리)
// ===================================
function getCurrentPath() {
    var p = (window.location.pathname || '').replace(/\/$/, '');
    var base = p.split('/').pop() || '';
    return base || 'dashboard.html';
}

function isActiveHref(href) {
    if (!href || href === '#') return false;
    var pathname = (window.location.pathname || '').replace(/\/$/, '');
    var current = getCurrentPath();
    if (current === href) return true;
    if (pathname === href) return true;
    if (pathname.endsWith('/' + href)) return true;
    return false;
}

function renderNavItem(item) {
    var fragment = document.createDocumentFragment();

    if (item.children && item.children.length > 0) {
        // 1depth 그룹 (버튼 + nav-sub)
        var group = document.createElement('div');
        group.className = 'nav-group';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-group-head';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<i data-lucide="' + (item.icon || 'circle') + '" aria-hidden="true"></i>' +
            '<span class="nav-label">' + (item.label || '') + '</span>' +
            '<i data-lucide="chevron-down" class="nav-chevron" aria-hidden="true"></i>' +
            '<span class="nav-tooltip">' + (item.label || '') + '</span>';
        group.appendChild(btn);

        var sub = document.createElement('div');
        sub.className = 'nav-sub';
        item.children.forEach(function(child) {
            if (child.children && child.children.length > 0) {
                // 2depth 그룹 (3depth 있음)
                var subItem = document.createElement('div');
                subItem.className = 'nav-sub-item';
                var subHead = document.createElement('button');
                subHead.type = 'button';
                subHead.className = 'nav-sub-head';
                subHead.setAttribute('aria-expanded', 'false');
                subHead.innerHTML = '<span class="nav-sub-head-label">' + (child.label || '') + '</span>' +
                    '<i data-lucide="chevron-down" class="nav-chevron" aria-hidden="true"></i>';
                subItem.appendChild(subHead);
                var inner = document.createElement('div');
                inner.className = 'nav-sub-inner';
                child.children.forEach(function(leaf) {
                    var a = document.createElement('a');
                    a.href = leaf.href || '#';
                    a.className = 'nav-item' + (isActiveHref(leaf.href) ? ' active' : '');
                    var label = (leaf.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    a.innerHTML = '<span class="nav-item-label">' + label + '</span>';
                    inner.appendChild(a);
                });
                subItem.appendChild(inner);
                sub.appendChild(subItem);
            } else {
                // 2depth 링크
                var a = document.createElement('a');
                a.href = child.href || '#';
                a.className = 'nav-sub-item nav-sub-item-link';
                a.innerHTML = '<span class="nav-sub-head-link">' + (child.label || '') + '</span>';
                if (isActiveHref(child.href)) a.classList.add('active');
                sub.appendChild(a);
            }
        });
        group.appendChild(sub);
        var anyChildActive = item.children.some(function(c) {
            if (c.href && isActiveHref(c.href)) return true;
            if (c.children) return c.children.some(function(leaf) { return isActiveHref(leaf.href); });
            return false;
        });
        if (anyChildActive) group.classList.add('has-active');
        fragment.appendChild(group);
    } else {
        // 1depth 단일 링크
        var group = document.createElement('div');
        group.className = 'nav-group';
        var active = isActiveHref(item.href);
        if (active) group.classList.add('has-active');
        var a = document.createElement('a');
        a.href = item.href || '#';
        a.className = 'nav-group-head' + (active ? ' active' : '');
        a.innerHTML = '<i data-lucide="' + (item.icon || 'circle') + '" aria-hidden="true"></i>' +
            '<span class="nav-label">' + (item.label || '') + '</span>' +
            '<span class="nav-tooltip">' + (item.label || '') + '</span>';
        group.appendChild(a);
        fragment.appendChild(group);
    }
    return fragment;
}

function renderNav(container, config) {
    if (!container || !config || !config.length) return;
    container.innerHTML = '';
    config.forEach(function(item) {
        container.appendChild(renderNavItem(item));
    });
}

// ===================================
// Sidebar Toggle Functionality
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    // Header / Aside 단일 관리: layout-templates.js 에서 주입
    var sidebarMount = document.getElementById('sidebarMount');
    var headerMount = document.getElementById('headerMount');
    if (typeof getSidebarHTML === 'function' && sidebarMount) {
        sidebarMount.innerHTML = getSidebarHTML();
    }
    if (typeof getHeaderHTML === 'function' && headerMount) {
        headerMount.innerHTML = getHeaderHTML();
    }

    var sidebar = document.getElementById('sidebar');
    var sidebarToggle = document.getElementById('sidebarToggle');
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileOverlay = document.getElementById('mobileOverlay');
    var fullscreenBtn = document.getElementById('fullscreenBtn');
    var navContainer = document.getElementById('sidebarNav');

    // NAV_CONFIG 있으면 네비 동적 생성 (단일 관리)
    if (typeof NAV_CONFIG !== 'undefined' && navContainer) {
        renderNav(navContainer, NAV_CONFIG);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    // 헤더 현재 날짜·시간 표시 (1초마다 갱신)
    // 서버 시간 연동: window.HEADER_DATETIME_SOURCE 를 Date 를 반환하는 함수로 덮어쓰면 됨.
    // 예: fetch('/api/time').then(r=>r.json()).then(data=> { HEADER_DATETIME_SOURCE = ()=> new Date(data.timestamp); });
    (function initHeaderDateTime() {
        var el = document.getElementById('headerDateTime');
        if (!el) return;
        var getTime = (typeof window.HEADER_DATETIME_SOURCE === 'function')
            ? window.HEADER_DATETIME_SOURCE
            : function() { return new Date(); };
        var weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        function format(d) {
            if (!(d instanceof Date)) d = new Date(d);
            var dateStr = d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
            var dayStr = weekdays[d.getDay()];
            var timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
            return { dateStr: dateStr, dayStr: dayStr, timeStr: timeStr, iso: d.toISOString() };
        }
        function update() {
            var d = getTime();
            var f = format(d);
            el.textContent = f.dateStr + ' (' + f.dayStr + ') ' + f.timeStr;
            el.setAttribute('datetime', f.iso);
        }
        update();
        setInterval(update, 1000);
    })();

    // 사이드바 상단 버튼: 데스크톱=접기/펼치기, 모바일=메뉴 닫기(dim과 동일)
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                sidebar.classList.remove('open');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
                sidebarToggle.setAttribute('aria-label', '메뉴 닫기');
            } else {
                var collapsed = sidebar.classList.toggle('collapsed');
                sidebarToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
                sidebarToggle.setAttribute('aria-label', collapsed ? '사이드바 펼치기' : '사이드바 접기');
            }
        });
    }

    // Mobile menu toggle (접근성: aria-expanded 동기화)
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.add('open');
            if (mobileOverlay) mobileOverlay.classList.add('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            if (sidebarToggle) sidebarToggle.setAttribute('aria-label', '메뉴 닫기');
        });
    }

    // Close mobile menu when clicking overlay
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', function() {
            sidebar.classList.remove('open');
            mobileOverlay.classList.remove('active');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    }

    // Close mobile menu when clicking any nav link
    document.querySelectorAll('.sidebar-nav a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                sidebar.classList.remove('open');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ----- 3depth 메뉴: 접힘/펼침, active 시 상위 모두 펼침 -----
    // 대메뉴(1depth) 토글
    document.querySelectorAll('.nav-group').forEach(function(group) {
        const head = group.querySelector(':scope > .nav-group-head');
        const sub = group.querySelector(':scope > .nav-sub');
        if (!head || !sub || head.tagName !== 'BUTTON') return;
        head.addEventListener('click', function() {
            var wasCollapsed = sidebar && sidebar.classList.contains('collapsed') && window.innerWidth >= 992;
            // 접힌 상태에서 하위 메뉴가 있는 대메뉴 클릭 시: 사이드바 펼침 + 해당 메뉴도 펼쳐서 하위 메뉴 표시 (데스크톱만)
            if (wasCollapsed) {
                sidebar.classList.remove('collapsed');
                if (sidebarToggle) {
                    sidebarToggle.setAttribute('aria-expanded', 'true');
                    sidebarToggle.setAttribute('aria-label', '사이드바 접기');
                }
                group.classList.add('expanded');
                head.setAttribute('aria-expanded', 'true');
                return;
            }
            group.classList.toggle('expanded');
            head.setAttribute('aria-expanded', group.classList.contains('expanded'));
        });
    });

    // 2depth 토글 (3depth 있는 경우)
    document.querySelectorAll('.nav-sub-item').forEach(function(item) {
        const btn = item.querySelector(':scope > .nav-sub-head');
        const inner = item.querySelector(':scope > .nav-sub-inner');
        if (!btn || !inner) return;
        btn.addEventListener('click', function() {
            item.classList.toggle('expanded');
            btn.setAttribute('aria-expanded', item.classList.contains('expanded'));
        });
    });

    // active인 항목이 있으면 해당 상위 메뉴 모두 펼침 (기본은 접힘)
    function expandActiveAncestors() {
        var active = document.querySelector('.sidebar-nav .nav-item.active, .sidebar-nav .nav-group-head.active, .sidebar-nav a.nav-sub-item-link.active');
        if (!active) return;
        var el = active.closest('.nav-sub-item');
        while (el) {
            el.classList.add('expanded');
            var btn = el.querySelector(':scope > .nav-sub-head');
            if (btn) btn.setAttribute('aria-expanded', 'true');
            el = el.parentElement.closest('.nav-sub-item');
        }
        el = active.closest('.nav-group');
        while (el) {
            el.classList.add('expanded');
            el.classList.add('has-active');
            var head = el.querySelector(':scope > .nav-group-head');
            if (head && head.tagName === 'BUTTON') head.setAttribute('aria-expanded', 'true');
            el = el.parentElement.closest('.nav-group');
        }
    }
    expandActiveAncestors();

    // Initialize Lucide icons after DOM is ready
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ----- Fullscreen toggle (cross-browser) -----
    (function initFullscreenToggle() {
        if (!fullscreenBtn) return;

        function getFullscreenElement() {
            return (
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                null
            );
        }

        function requestFullscreen(el) {
            const fn =
                el.requestFullscreen ||
                el.webkitRequestFullscreen ||
                el.mozRequestFullScreen ||
                el.msRequestFullscreen;
            if (fn) return fn.call(el);
            return Promise.reject(new Error('Fullscreen API not supported'));
        }

        function exitFullscreen() {
            const fn =
                document.exitFullscreen ||
                document.webkitExitFullscreen ||
                document.mozCancelFullScreen ||
                document.msExitFullscreen;
            if (fn) return fn.call(document);
            return Promise.reject(new Error('Fullscreen API not supported'));
        }

        function setFullscreenUI(isFullscreen) {
            fullscreenBtn.setAttribute('aria-pressed', isFullscreen ? 'true' : 'false');
            fullscreenBtn.setAttribute('aria-label', isFullscreen ? '전체화면 해제' : '전체화면');

            const iconName = isFullscreen ? 'minimize-2' : 'maximize-2';
            fullscreenBtn.innerHTML = `<i data-lucide="${iconName}"></i>`;
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        function syncFromBrowserState() {
            setFullscreenUI(Boolean(getFullscreenElement()));
        }

        fullscreenBtn.addEventListener('click', function() {
            const isFullscreen = Boolean(getFullscreenElement());
            const root = document.documentElement;

            const action = isFullscreen ? exitFullscreen() : requestFullscreen(root);
            Promise.resolve(action).catch(function() {
                // If blocked (e.g. not a user gesture or unsupported), keep UI in sync with actual state.
                syncFromBrowserState();
            });
        });

        document.addEventListener('fullscreenchange', syncFromBrowserState);
        document.addEventListener('webkitfullscreenchange', syncFromBrowserState);
        document.addEventListener('mozfullscreenchange', syncFromBrowserState);
        document.addEventListener('MSFullscreenChange', syncFromBrowserState);

        syncFromBrowserState();
    })();

    // ----- 연차현황 프로그레스: 0 -> 목표치 애니메이션 + % 툴팁(항상 표시) -----
    (function initLeaveStatusProgress() {
        const bar = document.querySelector('.leave-status-bar');
        const fill = document.querySelector('.leave-status-bar-fill');
        const tooltip = document.querySelector('.leave-status-bar-tooltip');
        const tooltipText = document.querySelector('.leave-status-bar-tooltip-text');
        if (!bar || !fill || !tooltip || !tooltipText) return;

        const now = Number(bar.getAttribute('aria-valuenow') || '0');
        const min = Number(bar.getAttribute('aria-valuemin') || '0');
        const max = Number(bar.getAttribute('aria-valuemax') || '0');
        const denom = Math.max(1e-9, (max - min));
        const pct = Math.max(0, Math.min(100, ((now - min) / denom) * 100));

        const pctText = `${pct.toFixed(1)}%`;
        tooltipText.textContent = pctText;

        // 시작값 0으로 고정
        fill.style.width = '0%';
        tooltip.style.left = '0%';

        // 다음 프레임에서 목표치로 이동(애니메이션)
        requestAnimationFrame(function() {
            fill.style.width = `${pct}%`;
            tooltip.style.left = `${pct}%`;
        });
    })();

    // ----- 시간외근무 원형 차트: 0 -> 목표치 애니메이션 -----
    (function initOvertimeRing() {
        const ring = document.querySelector('.overtime-status-ring');
        if (!ring) return;
        const progressCircle = ring.querySelector('.overtime-ring-progress');
        const trackCircle = ring.querySelector('.overtime-ring-track');
        if (!progressCircle || !trackCircle) return;

        const pct = Math.max(0, Math.min(100, Number(ring.getAttribute('data-progress') || '0')));
        const r = Number(progressCircle.getAttribute('r') || '0');
        if (!r) return;
        const circumference = 2 * Math.PI * r;

        // dash 설정
        progressCircle.style.strokeDasharray = `${circumference}`;
        trackCircle.style.strokeDasharray = `${circumference}`;

        // 시작(0%): offset = circumference (transition 없이 세팅)
        const prevTransition = progressCircle.style.transition;
        progressCircle.style.transition = 'none';
        progressCircle.style.strokeDashoffset = `${circumference}`;
        // reflow to lock the start state
        void progressCircle.getBoundingClientRect();

        // 목표: offset = circumference * (1 - pct/100) (여기서부터 transition 적용)
        const targetOffset = circumference * (1 - pct / 100);
        progressCircle.style.transition = prevTransition || '';
        requestAnimationFrame(function () {
            progressCircle.style.strokeDashoffset = `${targetOffset}`;
        });
    })();

    // ----- 시간외근무 시간(6.5) 숫자 카운트업: 0 -> 목표치 -----
    (function initOvertimeHoursCountUp() {
        const el = document.querySelector('.overtime-status-number');
        if (!el) return;
        const target = Number(el.getAttribute('data-value') || el.textContent || '0');
        if (!Number.isFinite(target)) return;

        const durationMs = 900;
        const start = performance.now();
        const decimals = (String(el.getAttribute('data-value') || '').split('.')[1] || '').length || 1;

        function tick(now) {
            const t = Math.min(1, (now - start) / durationMs);
            // easeOutCubic
            const eased = 1 - Math.pow(1 - t, 3);
            const value = target * eased;
            el.textContent = value.toFixed(decimals);
            if (t < 1) requestAnimationFrame(tick);
        }
        el.textContent = (0).toFixed(decimals);
        requestAnimationFrame(tick);
    })();

    // ----- 시간외근무 원형 차트 중앙 퍼센트(75%) 카운트업: 0 -> 목표치 -----
    (function initOvertimePercentCountUp() {
        const el = document.querySelector('.overtime-ring-text');
        if (!el) return;
        const target = Number(el.getAttribute('data-value') || (el.textContent || '0').replace('%', ''));
        if (!Number.isFinite(target)) return;

        const durationMs = 900;
        const start = performance.now();

        function tick(now) {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(target * eased);
            el.textContent = `${value}%`;
            if (t < 1) requestAnimationFrame(tick);
        }

        el.textContent = '0%';
        requestAnimationFrame(tick);
    })();
});

// ===================================
// Utility Functions
// ===================================

// Format date to Korean format
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// Format time to HH:MM
function formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Show toast notification (if needed)
function showToast(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement a toast notification library here
}

// ===================================
// Form Handlers
// ===================================

// Handle attendance form submission
function handleAttendanceForm(formType) {
    console.log(`Attendance form submitted: ${formType}`);
    showToast(`${formType} 신청이 접수되었습니다.`, 'success');
}

// Handle HR form download
function handleHRFormDownload(formType) {
    console.log(`HR form download: ${formType}`);
    showToast(`${formType}를 다운로드합니다.`, 'info');
}

// ===================================
// Event Listeners for Interactive Elements
// ===================================

// Attendance form buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.attendance-form-btn')) {
        const btn = e.target.closest('.attendance-form-btn');
        const formType = btn.querySelector('span').textContent;
        handleAttendanceForm(formType);
    }
});

// More buttons
document.addEventListener('click', function(e) {
    if (e.target.closest('.btn-more')) {
        e.preventDefault();
        const widget = e.target.closest('.card');
        const title = widget.querySelector('.widget-title').textContent;
        console.log(`More button clicked for: ${title}`);
        showToast(`${title} 전체 보기`, 'info');
    }
});

// Shortcut cards
document.addEventListener('click', function(e) {
    if (e.target.closest('.shortcut-card:not(.active)')) {
        const card = e.target.closest('.shortcut-card');
        card.classList.add('active');
        const label = card.querySelector('span').textContent;
        showToast(`${label} 즐겨찾기에 추가되었습니다.`, 'success');
        
        // Re-initialize icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
});
