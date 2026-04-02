/**
 * 사이드바 네비게이션 설정 (단일 관리)
 * - 링크, 명칭, 아이콘, 2/3depth 구조를 여기서만 수정하면 됨.
 * - active·펼침은 현재 페이지 경로로 자동 처리됨.
 *
 * 구조:
 * - 단일 링크: { label, href, icon }
 * - 하위 메뉴 있음: { label, icon, children: [ ... ] }
 *   - 2depth 링크: { label, href }
 *   - 2depth에 3depth 있음: { label, children: [ { label, href }, ... ] }
 */
var NAV_CONFIG = [
    {
        label: "홈",
        href: "dashboard.html",
        icon: "home"
    },
    {
        label: "인사정보",
        href: "hr-info.html",
        icon: "users"
    },
    {
        label: "문서관리",
        icon: "file-text",
        children: [
            { label: "서약서/계약서", href: "doc-oath-contract.html" },
            { label: "각종 증명서", href: "doc-certificates.html" }
        ]
    },
    {
        label: "휴가관리",
        icon: "calendar",
        children: [
            { label: "일반휴가", href: "leave-general.html" },
            { label: "경조휴가", href: "leave-ceremony.html" },
            { label: "기타휴가", href: "leave-etc.html" }
        ]
    },
    {
        label: "근태관리",
        icon: "clock",
        children: [
            { label: "근무현황", href: "attendance-work-status.html" },
            { label: "단축근로", href: "attendance-shortened-work.html" },
            { label: "휴직현황", href: "attendance-leave-status.html" }
        ]
    },
    {
        label: "급여관리",
        icon: "wallet",
        children: [
            { label: "내 급여조회", href: "payroll-my.html" },
            { label: "연말정산내역", href: "payroll-yearend.html" }
        ]
    },
    { label: "복리후생", href: "benefits.html", icon: "gift" },
    {
        label: "메뉴 예시",
        icon: "file-text",
        children: [
            {
                label: "예시 카테고리",
                children: [
                    { label: "부트스트랩 예시1", href: "bootstrap-sample.html" },
                    { label: "부트스트랩 예시2", href: "bootstrap-sample2.html" }
                ]
            }
        ]
    },
    {
        label: "로그인 화면",
        href: "index.html",
        icon: "log-out"
    }
];
