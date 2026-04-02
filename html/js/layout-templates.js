/**
 * Header / Aside(사이드바) 공통 레이아웃 단일 관리
 * - 프로필, 로고, 회사명 등은 LAYOUT_CONFIG 에서 수정
 * - 각 페이지는 #sidebarMount, #headerMount 만 두고 이 스크립트 + main.js 로드
 */
var LAYOUT_CONFIG = {
    companyName: "웅진프리드라이프",
    logoAlt: "웅진프리드라이프 로고",
    logoUrl: "assets/logo.svg",
    logoMobileUrl: "assets/logo3.svg",
    rootUrl: "dashboard.html",
    profileImage: "https://images.unsplash.com/photo-1738566061505-556830f8b8f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
    profileName: "홍길동",
    profileDept: "웹솔루션사업팀",
    profilePosition: "책임매니저 / 팀원",
    logoutUrl: "index.html"
};

function getSidebarHTML() {
    var c = LAYOUT_CONFIG;
    return '<aside class="sidebar" id="sidebar" aria-label="주 메뉴">' +
        '<div class="sidebar-toggle-container">' +
        '<button class="btn sidebar-toggle" id="sidebarToggle" aria-label="사이드바 접기" aria-expanded="true">' +
        '<i data-lucide="chevron-left" class="icon-collapse" aria-hidden="true"></i>' +
        '<i data-lucide="menu" class="icon-expand d-none" aria-hidden="true"></i>' +
        '</button></div>' +
        '<div class="sidebar-divider"></div>' +
        '<div class="sidebar-profile">' +
        '<div class="sidebar-profile-photo"><img src="' + (c.profileImage || '') + '" alt="프로필"></div>' +
        '<div class="sidebar-profile-info">' +
        '<div class="sidebar-profile-name">' + (c.profileName || '') + '</div>' +
        '<div class="sidebar-profile-dept">' + (c.profileDept || '') + '</div>' +
        '<div class="sidebar-profile-position">' + (c.profilePosition || '') + '</div>' +
        '</div></div>' +
        '<nav id="sidebarNav" class="sidebar-nav" aria-label="주 메뉴"></nav>' +
        '</aside>';
}

function getHeaderHTML() {
    var c = LAYOUT_CONFIG;
    return '<header class="top-header">' +
        '<div class="header-left">' +
        '<button class="btn mobile-menu-btn d-lg-none" id="mobileMenuBtn" aria-label="메뉴 열기" aria-expanded="false" aria-controls="sidebar">' +
        '<i data-lucide="menu" aria-hidden="true"></i></button>' +
        '<a href="' + (c.rootUrl || 'dashboard.html') + '" class="header-logo-link" aria-label="홈으로">' +
        '<picture>' +
        '<source media="(max-width: 991px)" srcset="' + (c.logoMobileUrl || c.logoUrl) + '">' +
        '<img src="' + (c.logoUrl || '') + '" alt="' + (c.logoAlt || '') + '" class="header-logo">' +
        '</picture></a>' +
        '<span class="header-company-name visually-hidden">' + (c.companyName || '') + '</span>' +
        '</div>' +
        '<div class="header-right">' +
        '<time id="headerDateTime" class="header-datetime" datetime="" aria-live="polite"></time>' +
        '<button class="btn icon-btn notification-btn" aria-label="알림">' +
        '<i data-lucide="bell"></i>' +
        '<span class="notification-dot" aria-hidden="false"></span>' +
        '</button>' +
        '<button class="btn icon-btn fullscreen-btn" id="fullscreenBtn" aria-label="전체화면" aria-pressed="false">' +
        '<i data-lucide="maximize-2"></i></button>' +
        '<button type="button" class="btn icon-btn" onclick="window.location.href=\'' + (c.logoutUrl || 'index.html') + '\'" aria-label="로그아웃">' +
        '<i data-lucide="log-out" aria-hidden="true"></i></button>' +
        '</div></header>';
}
