// Kiểm tra: sửa thông tin công ty ở /admin thì CHATBOT có nói theo không?
//
// Vì sao cần bài này: kienThuc.json viết {{cong_ty.dien_thoai}} thay vì số cứng,
// và chatBrain điền vào lúc chạy. Nếu chatService lỡ đọc cứng company.json từ
// bundle (như bản trước) thì Navbar/Footer đổi số mà bot vẫn đọc số cũ cho
// khách nghe — sai thông tin công ty, lỗi kín và khó phát hiện.
//
// Chạy: npm run test:congty

import { findAnswer } from "../src/services/chatBrain.js";
import knowledge from "../src/data/kienThuc.json" with { type: "json" };
import companyGoc from "../src/data/company.json" with { type: "json" };

const SO_MOI = "+84 999 888 777";
const EMAIL_MOI = "moi@imob.vn";

const congTyMoi = { ...companyGoc, phone: SO_MOI, email: EMAIL_MOI };

let dat = 0;
let hong = 0;

function kt(ten, dieuKien, chiTiet = "") {
  if (dieuKien) {
    dat++;
    console.log(`  DAT     ${ten}`);
  } else {
    hong++;
    console.log(`  !! HONG ${ten}  ${chiTiet}`);
  }
}

const CAU_HOI = [
  "số điện thoại của công ty là gì",
  "cho xin hotline",
  "email liên hệ",
];

console.log("Kiem tra bot dung thong tin cong ty MOI NHAT\n");

for (const cauHoi of CAU_HOI) {
  const kq = findAnswer(cauHoi, knowledge, congTyMoi);
  const noiSoMoi = kq.answer.includes(SO_MOI) || kq.answer.includes(EMAIL_MOI);
  const conSoCu =
    kq.answer.includes("936 982 256") || kq.answer.includes("admin@imob.vn");

  console.log(`[${cauHoi}]`);
  console.log(`  -> ${kq.answer.slice(0, 90)}`);
  kt("dung thong tin moi", noiSoMoi, `(khong thay ${SO_MOI} hay ${EMAIL_MOI})`);
  kt("khong con thong tin cu", !conSoCu, "(van con so/email cu trong cau tra loi)");
}

// Không được còn placeholder chưa thay
const con = findAnswer("hotline", knowledge, congTyMoi).answer;
kt("khong con {{cong_ty.*}} chua thay", !con.includes("{{cong_ty."), `(${con.slice(0, 60)})`);

console.log(`\n${"=".repeat(50)}`);
console.log(`KET QUA: ${dat} dat / ${dat + hong} kiem tra`);
if (hong > 0) {
  console.log(`!!! ${hong} KIEM TRA HONG`);
  process.exit(1);
}
