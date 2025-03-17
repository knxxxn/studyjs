'use client'

import { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill-new/dist/quill.snow.css'

const QuillNoSSR = dynamic(() => import('react-quill-new'), { ssr: false })

export default function HtmlEditor({
  text,
  setText,
  height,
}: {
  text: string
  setText?: Function
  height?: string
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const imageHandler = () => {
        const input = document.createElement('input')
        input.setAttribute('type', 'file')
        input.setAttribute('accept', 'image/*')
        input.click()

        input.addEventListener('change', async () => {
          const file = input.files?.[0]
          try {
            /*
            const response = await addImage(file!)
            const imagePath = `http://localhost:3000/saveImages/` + encodeURI(response.data)
            const editor = quillRef.current.getEditor()
            const range = editor.getSelection()
            editor.insertEmbed(range.index, 'image', imagePath)
            */
          } catch (error) {
            console.log(error)
          }
        })
      }
    }
  }, [])

  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ align: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['image'],
          [
            {
              color: [],
            },
            { background: [] },
          ],
        ],
        handlers: {
          image: () => {}, // placeholder for the actual handler
        },
      },
    }
  }, [])

  const handleChange = (value: string) => {
    // 상태가 변경된 경우에만 업데이트
    if (setText && value !== text) {
      setText(value)
    }
  }

  return (
    <QuillNoSSR
      theme="snow"
      style={{ height: height }}
      modules={modules}
      onChange={handleChange}
      value={text}
      readOnly={setText === undefined}
    />
  )
}
