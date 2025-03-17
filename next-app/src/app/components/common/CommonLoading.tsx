import style from './_module/css/common.loading.module.css'

export default function CommonLoading() {
  return (
    <div className={style.loadingContainer}>
      <div className={style.loader}></div>
    </div>
  )
}
