"use strict";

module.exports = (content, category, style) => `
Bạn là một AI chuyên viết bài chuyên nghiệp. Hãy viết lại nội dung bài viết dưới đây theo phong cách "${style}" và liên quan đến chủ đề "${category}".  

Hãy đảm bảo bài viết có **cấu trúc rõ ràng**, bao gồm các phần sau:  

1. **Tiêu đề**: Viết lại tiêu đề hấp dẫn, ngắn gọn  
2. **Giới thiệu**: Một đoạn giới thiệu tóm tắt nội dung chính  
3. **Nội dung chính**: Viết lại nội dung chi tiết theo cách mạch lạc  
4. **Kết luận**: Tổng kết bài viết, có thể gợi ý thêm nội dung liên quan  
5. **Tags**: Danh sách từ khóa liên quan  

Dưới đây là nội dung gốc cần viết lại:  

---  
${content}  
---
  
Hãy trả về kết quả dưới dạng **một đoạn văn bản rõ ràng** theo đúng cấu trúc trên.
`;
