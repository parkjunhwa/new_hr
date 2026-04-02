# 웅진프리드라이프 Frontend (HTML UI) README

이 프로젝트는 웅진프리드라이프 대시보드 및 인사·업무 페이지의 프론트엔드 HTML UI를 제공합니다.  
개발자는 아래 정보를 참고하여 개발, 유지보수, 확장 작업을 진행할 수 있습니다.

---

## 프로젝트 구조

```text
html/
  ├── index.html                 # 로그인 페이지
  ├── dashboard.html             # 메인 대시보드
  ├── hr-info.html               # 인사정보 (개인정보 조회·변경요청, 앵커 네비)
  ├── doc-oath-contract.html     # 문서관리 > 서약서/계약서
  ├── doc-certificates.html      # 문서관리 > 각종 증명서
  ├── leave-general.html         # 휴가관리 > 일반휴가
  ├── leave-ceremony.html        # 휴가관리 > 경조휴가
  ├── leave-etc.html             # 휴가관리 > 기타휴가
  ├── attendance-work-status.html    # 근태관리 > 근무현황 (소정/연장/월별 근로시간)
  ├── attendance-shortened-work.html # 근태관리 > 단축근로
  ├── attendance-leave-status.html   # 근태관리 > 휴직현황
  ├── attendance-manage.html     # 근태관리 진입 → 근무현황으로 리다이렉트
  ├── payroll-my.html            # 급여관리 > 내 급여조회
  ├── payroll-yearend.html       # 급여관리 > 연말정산내역
  ├── benefits.html              # 복리후생
  ├── bootstrap-sample.html      # 메뉴 예시 > 부트스트랩 예시1
  ├── bootstrap-sample2.html     # 메뉴 예시 > 부트스트랩 예시2
  ├── css/
  │   ├── styles.css             # 전역·조회조건·테이블 그리드·근태/급여·반응형
  │   └── datepicker-style.css   # Datepicker 브랜드·한국어
  ├── js/
  │   ├── layout-templates.js    # Header / Aside 공통 레이아웃
  │   ├── nav-config.js          # 네비게이션 단일 설정
  │   └── main.js                # 레이아웃 주입, 네비 active, 사이드바
  ├── lib/                       # Bootstrap, Lucide, Datepicker
  ├── assets/
  └── README.md
```

- **attendance-work-status.html**  
  근무년월 조회, 소정·연장 근로시간 테이블(높이 분할·키보드 조절), 월별근로시간 요약.

- **attendance-shortened-work.html** · **attendance-leave-status.html**  
  단축근로 / 휴직 신청·사용 내역 테이블 그리드.

- **payroll-my.html**  
  조회년월·급여구분, 급여 기본정보(접기), 합계, 급여세부내역 표, 산출내역 모달.

- **payroll-yearend.html**  
  연도별 연말정산 내역 및 출력 버튼.

- **dashboard.html > 즐겨찾기**  
  6칸 그리드·`+`로 모달 열기(Bootstrap 중간 모달 + `modal-dialog-centered`).  
  **모달**: 본문에 셀렉트 1개(미선택 문서만), 푸터에서 **닫기** 오른쪽 **추가**로 첫 빈 칸에 반영. **그리드**: **문서 카드** 드래그로 순서 변경·빈 칸 이동. 카드 **오른쪽 위 검은 원형(16px, 흰색 −)** 으로 해당 항목 제거.  
  후보 목록은 **`dashboard.html`의 `FAVORITE_MENU_ITEMS`만**(문서명·URL·`value`). **사이드 메뉴와 자동 연동 없음.**  
  **저장**: `window.localStorage` 키 `newHR_dashboard_favorites_v3` — JSON 배열 길이 6, 요소는 `value` 문자열 또는 `null`. 추가·드래그·제거 시마다 저장.  
  예전 키 `newHR_dashboard_favorites_v2`가 있으면 최초 로드 시 v3 형식으로 읽어 저장(상세는 `dashboard.html` 내 블록 주석).  
  개발자 도구 → Application / 저장소 → Local Storage에서 키로 확인.

---

## 메뉴 구성 (nav-config.js)

| 메뉴 | 설명 |
| --- | --- |
| 홈 | dashboard.html |
| 인사정보 | hr-info.html |
| 문서관리 | 서약서/계약서, 각종 증명서 |
| 휴가관리 | 일반/경조/기타 휴가 |
| 근태관리 | 근무현황, 단축근로, 휴직현황 |
| 급여관리 | 내 급여조회, 연말정산내역 |
| 복리후생 | benefits.html |
| 메뉴 예시 | 부트스트랩 예시1·2 |
| 로그인 화면 | index.html |

---

## 공통 UI 컴포넌트

- **조회조건 카드**  
  `.query-condition-card` > `.query-condition-form` > `.query-condition-group`. 검색 버튼은 `ms-auto`로 우측. **반응형**: 767px 이하 세로 배치.

- **테이블 그리드**  
  `.table-grid-card` > `.table-grid-card-body` > `.table-grid-scroll` > `.table-grid-table`. thead sticky, 가로·세로 스크롤. `<colgroup>`으로 열 너비.

- **데이터 없음**  
  `.empty-state-row` + `.empty-state-block` 패턴.

---

## 반응형 (styles.css)

| 구간 | 용도 |
| --- | --- |
| max-width: 767px | 모바일 조회조건·테이블·급여 기본정보 등 |
| max-width: 991px | 사이드바 오버레이 |
| min-width: 992px | 데스크톱 사이드바 상시 |

---

## 기술 스택

Bootstrap 5, Lucide Icons, VanillaJS-Datepicker, Vanilla JS.

---

## 웹접근성 (A11y)

공통으로 **스킵 링크**(`본문 바로가기`), **`<main aria-label="…">`**(페이지별 본문 구역), 브레드크럼 **`nav aria-label="현재 위치"`** 를 사용합니다.

**근태관리 페이지**

- 조회 조건: `<section aria-labelledby>` + 제목은 `.visually-hidden` `h2`.
- 소정/연장 근로시간: 테이블 스크롤 영역 `role="region"` + `aria-labelledby`와 표 `caption.visually-hidden`.
- 분할 조절 막대: `role="separator"`, `aria-describedby`로 키보드(화살표·Shift·Home·End) 안내.
- 월별근로시간: `<section aria-labelledby>` + 동일 패턴.

**급여관리 페이지**

- 조회 조건·급여 기본정보·합계: `section` 또는 `aria-label` / `aria-labelledby`로 구획.
- 합계 금액: `<label for>`와 읽기 전용 `input` 연결, `role="group"`.
- 급여세부내역: 접힘 영역 `role="region"` `aria-labelledby`, 표는 `aria-describedby`로 단위(원) 안내.
- 산출내역 버튼: `aria-haspopup="dialog"` `aria-controls` (모달).
- 레이블이 있는 입력에는 **중복 `aria-label` 제거** (달력 트리거 등 보조 컨트롤만 `aria-label` 유지).

**권장 점검**

- 키보드만으로 조회·접기·모달·분할 막대 조작
- 스크린 리더로 랜드마크·표 제목·폼 레이블 읽기
- 색 대비(WCAG)

---

## 개발 가이드

- 스타일: `css/styles.css` 섹션 주석 참고.
- 메뉴: `nav-config.js`만 수정.
- 헤더 시간: `main.js` 로드 전 `window.HEADER_DATETIME_SOURCE` 등 문서 참고.

---

박준화 수석 01094793188 (26.03.24)
