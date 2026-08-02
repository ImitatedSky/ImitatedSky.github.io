## 1. Implementation

- [x] 1.1 Match original padding: `px-8 py-8` → `px-10 py-12` (40px sides, 48px top/bottom — original is `padding: 50px 40px`)
- [x] 1.2 Keep `max-w-none` — `#article-container` in original has no width constraint, fills the 74% column

## 2. Verification

- [x] 2.1 `npm run build` — no errors
- [x] 2.2 Padding matches original (40px sides confirmed from `main` branch compiled CSS)
- [ ] 2.3 Visual check: code blocks scroll horizontally, images scale within prose
- [ ] 2.4 Compare against https://pochunyeh.com/posts/Leetcode-快速複習的題目/
