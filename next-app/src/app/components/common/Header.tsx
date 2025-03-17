'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import style from './_module/css/header.module.css'

export default function Header() {
  const [mode, setMode] = useState(false)
  const { setTheme } = useTheme()

  function switchToggle(bool: boolean) {
    setMode(bool)
  }

  useEffect(() => {
    if (mode) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [mode])

  return (
    <div className={style.container}>
      <div className={style.modeWrap}>
        <Switch checked={mode} onCheckedChange={(bool) => switchToggle(bool)} />
        <Label className={style.icon}>
          {mode ? (
            <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          )}
        </Label>
      </div>
    </div>
  )
}
