# Dashboard Enhancement Apply Guide

## 1) Add enhancement assets
In `<head>` add:

```html
<link rel="stylesheet" href="/intranet/assets/css/gw_dashboard.css">
<link rel="stylesheet" href="/intranet/assets/css/gw_dashboard_enhance.css?v=20260212">
```

Before `</body>` add:

```html
<script src="/intranet/assets/js/gw_dashboard.js?v=20260123"></script>
<script src="/intranet/assets/js/gw_dashboard_memo.js?v=20260123"></script>
<script src="/intranet/assets/js/gw_dashboard_enhance.js?v=20260212"></script>
```

## 2) Fix HTML structure error
In `gw-nav` area, close the `acc_board` group before the next group starts.

```html
        <div class="gw-submenu" id="acc_board">
          ...
        </div>
      </div> <!-- missing close: .gw-nav-group -->

      <div class="gw-nav-group" data-acc="1">
        <button type="button" class="gw-nav-group-btn" aria-expanded="false" data-target="acc_sched">
```

## 3) Move large modal block to include file
Current source says modals are split, but markup is still inline.
Move all three modal blocks to one include:

```asp
<!--#include virtual="/intranet/main/inc/gw_dashboard_modals.inc" -->
```

Recommended split:
- `/intranet/main/inc/gw_dashboard_modals.inc`
- `/intranet/main/inc/gw_dashboard_nav.inc`
- `/intranet/main/inc/gw_dashboard_sidebar_right.inc`

## 4) Runtime checks after apply
- Accordion open/close works in left menu.
- Existing `gw_dashboard.js` side-nav behavior still works (no duplicate toggle).
- Modal open/close animation works for all three modals.
- KPI cards are horizontally scrollable on mobile.
- Board/absence tables keep layout via horizontal scroll on small screens.
