/* ----------------------------------------------------
   نوافذ تسجيل الدخول والتسجيل
---------------------------------------------------- */
function showLogin(){document.getElementById('loginModal').style.display='flex'}
function showSignup(){document.getElementById('signupModal').style.display='flex'}
function closeModal(id){document.getElementById(id).style.display='none'}

/* ----------------------------------------------------
   فحص قوة كلمة المرور
---------------------------------------------------- */
function checkPasswordStrength(){
    const pass=document.getElementById('signupPassword').value
    const strength=document.getElementById('passwordStrength')
    const regex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

    if(regex.test(pass)){
        strength.textContent='كلمة المرور قوية'
        strength.classList.add('password-strong')
    }else{
        strength.textContent='كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم ورمز وطولها أكثر من 8 أحرف'
        strength.classList.remove('password-strong')
    }
}

/* ----------------------------------------------------
   التعامل مع المستخدمين وتخزينهم
---------------------------------------------------- */
let users=JSON.parse(localStorage.getItem('users')||'[]')

/* ----------------------------------------------------
   إعداد EmailJS
---------------------------------------------------- */
emailjs.init("mE1DizzZ3EgGwTcgj")

/* ----------------------------------------------------
   إرسال OTP
---------------------------------------------------- */
function sendOTP(to_email){
    if(!to_email) return alert("الرجاء إدخال البريد الإلكتروني!")

    const otp=Math.floor(100000+Math.random()*900000)
    const expiry=new Date(Date.now()+15*60000).toLocaleTimeString()

    localStorage.setItem("otp_for_"+to_email,JSON.stringify({otp,expiry}))

    emailjs.send("service_5rjktnp","template_vgxsdev",{
        otp:otp,
        time:expiry,
        to_email:to_email
    }).then(()=>{
        alert("تم إرسال رمز التحقق إلى بريدك الإلكتروني 👌")
    }).catch(err=>{
        alert("حدث خطأ في الإرسال")
        console.log(err)
    })
}

/* ----------------------------------------------------
   التحقق من OTP
---------------------------------------------------- */
function verifyOTP(to_email,enteredOTP){
    const record=JSON.parse(localStorage.getItem("otp_for_"+to_email))
    if(!record) return alert("لم يتم إرسال رمز التحقق بعد!")

    const currentTime=new Date()
    const expiryTime=new Date()
    const [h,m,s]=record.expiry.split(":")
    expiryTime.setHours(h,m,s)

    if(currentTime>expiryTime){
        alert("انتهت صلاحية رمز التحقق")
        return false
    }

    if(parseInt(enteredOTP)===record.otp){
        alert("تم التحقق بنجاح ✅")
        localStorage.setItem("otp_verified_for_"+to_email,"true")
        return true
    }else{
        alert("رمز التحقق خاطئ ❌")
        return false
    }
}

/* ----------------------------------------------------
   إنشاء حساب
---------------------------------------------------- */
function handleSignup(e){
    e.preventDefault()

    const name=document.getElementById('signupName').value
    const email=document.getElementById('signupEmail').value
    const phone=document.getElementById('signupPhone').value
    const password=document.getElementById('signupPassword').value
    const address=document.getElementById('signupAddress')?.value||""

    if(localStorage.getItem("otp_verified_for_"+email)!=="true")
        return alert("يرجى إدخال رمز التحقق أولاً!")

    const regex=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    if(!regex.test(password)) return alert("كلمة المرور ضعيفة")

    if(users.some(u=>u.email===email))
        return alert("هذا البريد مسجل مسبقاً")

    users.push({name,email,phone,password,address})
    localStorage.setItem("users",JSON.stringify(users))
    localStorage.setItem("loggedIn","true")

    alert("تم إنشاء الحساب بنجاح!")
    closeModal("signupModal")
    checkAuthState()
}

/* ----------------------------------------------------
   تسجيل الدخول
---------------------------------------------------- */
function handleLogin(e){
    e.preventDefault()

    const email=document.getElementById('loginEmail').value
    const password=document.getElementById('loginPassword').value
    const user=users.find(u=>u.email===email&&u.password===password)

    if(user){
        alert("تم تسجيل الدخول بنجاح!")
        localStorage.setItem("loggedIn","true")
        closeModal("loginModal")
        checkAuthState()
    }else{
        alert("البريد أو كلمة المرور خاطئة")
    }
}

/* ----------------------------------------------------
   التحقق من حالة الدخول
---------------------------------------------------- */
document.addEventListener("DOMContentLoaded",checkAuthState)

function checkAuthState(){
    const isLoggedIn=localStorage.getItem("loggedIn")
    const authButtons=document.getElementById("authButtons")
    let logoutBtn=document.getElementById("logoutBtn")

    if(isLoggedIn==="true"){
        if(authButtons) authButtons.style.display="none"
        if(!logoutBtn){
            logoutBtn=document.createElement("button")
            logoutBtn.id="logoutBtn"
            logoutBtn.className="btn btn-outline"
            logoutBtn.innerText="تسجيل خروج"
            logoutBtn.onclick=logout
            document.querySelector(".nav-container").appendChild(logoutBtn)
        }
    }else{
        if(authButtons) authButtons.style.display="flex"
        if(logoutBtn) logoutBtn.remove()
    }
}

function logout(){
    localStorage.removeItem("loggedIn")
    location.reload()
}

/* ----------------------------------------------------
   الحجز
---------------------------------------------------- */
function bookService(service){
    if(localStorage.getItem("loggedIn")!=="true"){
        alert("يجب تسجيل الدخول أولاً")
        showLogin()
        return
    }
    alert("تم حجز خدمة: "+service)
    openTimeModal()
}

function openTimeModal(){
    document.getElementById("timeModal").style.display="block"
}

function submitBooking(e){
    e.preventDefault()
    const date=document.getElementById("bookingDate").value
    const time=document.getElementById("bookingTime").value
    alert(`تم حجز الخدمة في ${date} الساعة ${time}`)
    closeModal("timeModal")
}

/* ----------------------------------------------------
   الدفع
---------------------------------------------------- */
function togglePaymentForm(){
    const form=document.getElementById("paymentForm")
    form.style.display=form.style.display==="none"?"block":"none"
}

/* ----------------------------------------------------
   تتبع الفني
---------------------------------------------------- */
function trackTechnician(){
    const statuses=["الفني قريب 🔵","الفني بعيد 🟡","الفني وصل ✅"]
    document.getElementById("trackingStatus").innerText=
        statuses[Math.floor(Math.random()*statuses.length)]
}

/* ----------------------------------------------------
   عرض الفنيين
---------------------------------------------------- */
function showTechnicians(){
    const section=document.getElementById("technicians")
    section.style.display=
        section.style.display==="block"?"none":"block"
}

function contactTechnician(name){
    alert("تم اختيار الفني: "+name)
}

/* ----------------------------------------------------
   آراء العملاء (النظام النهائي فقط)
---------------------------------------------------- */
function addReview(){
    const name=document.getElementById("reviewName").value.trim()
    const service=document.getElementById("reviewService").value
    const text=document.getElementById("reviewText").value.trim()
    const stars=document.getElementById("reviewStars").value

    if(!name||!service||!text){
        alert("يرجى تعبئة جميع الحقول")
        return
    }

    const card=document.createElement("div")
    card.className="review-card"
    card.innerHTML=`
      <div class="stars">${stars}</div>
      <p>"${text}"</p>
      <h4>${name}</h4>
      <small>خدمة: ${service}</small>
    `

    document.getElementById("reviewsGrid").appendChild(card)

    document.getElementById("reviewName").value=""
    document.getElementById("reviewService").value=""
    document.getElementById("reviewText").value=""
    document.getElementById("reviewStars").value="★★★★★"
}
