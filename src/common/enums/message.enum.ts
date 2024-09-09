export enum BadRequestMessage {
  InvalidLoginData = "اطلاعات برای ورود صحیح نیست",
  InvalidRegisterData = "اطلاعات برای ثبتنام صحیح نیست",
}
export enum AuthMessage {
  NotFoundAccount = "کاربری یافت نشد!",
  ExistUser = "کاربری با این مشخصات از قبل وجود دارد !",
  ExpiredCode = "کد یکبار مصرف شما منقضی شده!",
  TryAgain = "دوباره تلاش کنید",
}

export enum PublicMessage {
  SendOtp = "کد با موفقیت ارسال شد",
}
export enum NotFoundMessage {}
export enum ValidationMessage {}
