# 🧪 KeyFrame Wingman - Test Guide

## 📋 Yêu cầu Test Environment

### **Phần mềm cần thiết:**

- **Adobe Premiere Pro Beta 25.0+** (UXP support required)
- **UXP Developer Tool (UDT) v2.1+**
- **Chrome/Edge browser** (để debug console)

### **Project Setup:**

- Tạo project Premiere Pro mới
- Import ít nhất 1 video clip
- Tạo sequence và drag clip vào timeline

---

## 🔧 Cách Load Plugin vào Premiere Pro

### **Bước 1: Cài đặt UDT**

1. Download UDT v2.1 từ [Adobe Developer site](https://developer.adobe.com/console/servicesandapis)
2. Install và khởi động UDT
3. Mở Premiere Pro Beta

### **Bước 2: Load Plugin**

1. Trong UDT, click **"Add Plugin"**
2. Navigate đến folder `KFW-Pr/` và chọn `manifest.json`
3. Click **"Load"** để load plugin
4. Plugin panel sẽ xuất hiện trong Premiere Pro

### **Bước 3: Access Plugin**

- **Window** → **Extensions** → **KeyFrame Wingman**
- Hoặc tìm trong panel dock area

---

## ✅ Test Cases & Expected Results

### **Test 1: Giao diện UI** ⭐

**Mục tiêu:** Kiểm tra giao diện hiển thị đúng

**Steps:**

1. Load plugin vào Premiere Pro
2. Mở KeyFrame Wingman panel

**Expected Results:**

- [x] Header hiển thị "KeyFrame Wingman" với subtitle
- [x] Status indicator có chấm đỏ + text "No keyframes detected"
- [x] 2 sliders: "Ease In" và "Ease Out" với giá trị mặc định 25% và 75%
- [x] Cubic-bezier display: "cubic-bezier(0.25, 0, 0.75, 1)"
- [x] 3 buttons: "Refresh Selection", "Apply Easing", "Reset to Linear"
- [x] Instructions với debug toggle button
- [x] Apply button bị disabled (màu xám)

---

### **Test 2: Slider Interactions** ⭐

**Mục tiêu:** Kiểm tra sliders hoạt động real-time

**Steps:**

1. Drag slider "Ease In" từ 25% → 50%
2. Drag slider "Ease Out" từ 75% → 30%
3. Quan sát cubic-bezier display

**Expected Results:**

- [x] Giá trị slider update real-time khi drag
- [x] Cubic-bezier display update ngay: "cubic-bezier(0.50, 0, 0.30, 1)"
- [x] Debug console log changes (nếu debug mode bật)
- [x] Sliders smooth, không lag

**🔧 Fixed Issues:**

- ✅ Sửa lỗi range slider không grab được → Thêm `-webkit-appearance: none` và `-moz-appearance: none`
- ✅ Cross-browser compatibility cho slider styling

---

### **Test 3: Debug Mode** ⭐

**Mục tiêu:** Kiểm tra debug system

**Steps:**

1. Click "Show Debug Info" button
2. Debug section xuất hiện
3. Thực hiện các thao tác với sliders
4. Click "Hide Debug Info"

**Expected Results:**

- [x] Debug section hiện/ẩn khi click toggle
- [x] Debug logs hiển thị timestamp + messages
- [x] Slider changes được log với format: `[time] Sliders changed: In=X%, Out=Y%`
- [x] Debug section có scroll nếu quá nhiều logs

---

### **Test 4: Keyframe Detection** ⭐⭐

**Mục tiêu:** Test việc detect keyframes trong timeline

**Setup keyframes:**

1. Select clip trong timeline
2. Mở **Effect Controls** panel
3. Tạo keyframes cho **Motion > Scale** hoặc **Position**:
   - Set playhead tại frame 0, click stopwatch để enable keyframing
   - Move playhead tới frame 30, thay đổi giá trị Scale
   - Bạn sẽ có 2 keyframes

**Steps:**

1. Với keyframes đã tạo, quay lại KeyFrame Wingman panel
2. Click "Refresh Selection"
3. Quan sát status indicator

**Expected Results:**

- [x] Status indicator chuyển thành chấm xanh
- [x] Status text: "X keyframed properties detected"
- [x] Apply button enabled (màu xanh, có thể click)
- [x] Debug log hiển thị: "Found keyframes in: [property names]"

**❌ Nếu không detect được:**

- Status vẫn là chấm đỏ "No keyframes detected"
- Apply button vẫn disabled
- Debug log: "No keyframed properties found"

**🔧 Fixed Issues:**

- ✅ Sửa lỗi `sequence.getVideoTracks is not a function` → Dùng `getVideoTrackCount()` và `getVideoTrack(i)`
- ✅ Sửa lỗi `Illegal Parameter type` → Proper parameters cho `getTrackItems(CLIP, false)`
- ✅ Thêm alternative detection method nếu primary method fail
- ✅ Better error handling cho từng video track
- ✅ Sử dụng TypeScript definitions để implement đúng UXP API

**🔍 NEW: Keyframe Investigation Tools:**

**Debug Utility:** Tạo `debug-keyframes.html` để investigate:

- Project & sequence structure
- Track item analysis và selection detection
- Component chain inspection
- Property keyframe methods testing
- API method availability testing

**Enhanced Detection Strategy:**

1. **Primary Method**: Scan all tracks → components → properties → keyframes
2. **Alternative Method**: Use sequence selection → extract keyframes từ selected items
3. **Fallback Method**: Mock data for UI testing

---

### **Test 5: Apply Easing** ⭐⭐⭐

**Mục tiêu:** Test chức năng chính - apply easing lên keyframes

**Prerequisites:** Test 4 passed (có keyframes detected)

**Steps:**

1. Đảm bảo có keyframes được detect (chấm xanh)
2. Adjust sliders về giá trị mong muốn (ví dụ: In=30%, Out=70%)
3. Click "Apply Easing" button
4. Kiểm tra keyframes trong Effect Controls

**Expected Results:**

- [x] Button text đổi thành "APPLYING..." tạm thời
- [x] Status update: "Easing applied to X properties"
- [x] Debug logs hiển thị quá trình apply
- [x] **Keyframes trong Effect Controls** đổi từ Linear → Bezier
- [x] Keyframes có handles để adjust curves
- [x] Button reset về "APPLY EASING"

**❌ Nếu API chưa support:**

- Debug log: "Property X does not support keyframe manipulation"
- Status: "Failed to apply easing"

---

### **Test 6: Reset to Linear** ⭐⭐

**Mục tiêu:** Test reset sliders về linear (50%, 50%)

**Steps:**

1. Adjust sliders về giá trị bất kỳ
2. Click "Reset to Linear"

**Expected Results:**

- [x] Ease In slider → 50%
- [x] Ease Out slider → 50%
- [x] Cubic-bezier display: "cubic-bezier(0.50, 0, 0.50, 1)"
- [x] Debug log: "Reset to linear easing (0.5, 0, 0.5, 1)"

---

### **Test 7: Error Handling** ⭐⭐

**Mục tiêu:** Test xử lý lỗi và edge cases

**Test 7a: No Project**

1. Đóng tất cả projects trong Premiere Pro
2. Quan sát plugin behavior

**Expected:** Status "No active project"

**Test 7b: No Sequence**

1. Có project nhưng không có active sequence
2. Quan sát plugin behavior

**Expected:** Status "No active sequence"

**Test 7c: No Selection với Keyframes**

1. Clear timeline selection
2. Click "Refresh Selection"

**Expected:** Status "No keyframes detected in selection"

---

## 🎯 Success Criteria

### **✅ PASS Criteria:**

1. **UI hoàn chỉnh** - Tất cả elements hiển thị đúng design
2. **Slider interactions** - Real-time updates không lag
3. **Keyframe detection** - Detect được ít nhất 1 loại keyframe property
4. **Basic error handling** - Không crash khi no project/sequence
5. **Debug system** - Logs hiển thị đúng workflow

### **🌟 BONUS (Nice to have):**

- **Apply easing thành công** - Keyframes trong Effect Controls thay đổi interpolation
- **Multiple property support** - Detect được nhiều loại keyframes (Scale, Position, Rotation, etc.)
- **Performance** - Smooth với >10 keyframes

### **❌ FAIL Criteria:**

- Plugin không load được vào Premiere Pro
- UI bị broken hoặc không responsive
- Sliders không hoạt động
- Console errors liên tục

---

## 🐛 Common Issues & Solutions

### **Issue: Plugin không load**

**Solution:**

- Check Premiere Pro version (cần Beta 25.0+)
- Check UDT version (cần v2.1+)
- Check manifest.json syntax

### **Issue: API errors trong console**

**Solution:**

- UXP API chưa fully stable, một số methods có thể chưa work
- Focus test UI functionality trước
- Document API limitations

### **Issue: Keyframe detection không work**

**Solution:**

- API còn limitations, có thể cần manual workflow
- Test với different clip types (video, images, adjustment layers)

---

## 📊 Test Results Template

```
Test Date: ___________
Premiere Pro Version: ___________
UDT Version: ___________

✅ Test 1 - UI: PASS/FAIL
✅ Test 2 - Sliders: PASS/FAIL
✅ Test 3 - Debug: PASS/FAIL
✅ Test 4 - Detection: PASS/FAIL
✅ Test 5 - Apply: PASS/FAIL
✅ Test 6 - Reset: PASS/FAIL
✅ Test 7 - Errors: PASS/FAIL

Overall: PASS/FAIL
Notes: ___________
```

**🎯 Plugin được coi là thành công nếu pass ≥5/7 tests với UI hoạt động tốt!**
