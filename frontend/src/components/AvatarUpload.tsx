import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

interface Props {
  currentAvatar: string
  name: string
  onUpdate: (url: string) => void
}

const CLOUD_NAME = 'dpockqpyp'
const UPLOAD_PRESET = 'dayflow-avatars'

export default function AvatarUpload({ currentAvatar, name, onUpdate }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentAvatar)
  const inputRef = useRef<HTMLInputElement>(null)
  const token = localStorage.getItem('token')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida!')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB!')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )

      const cloudData = await cloudRes.json()

      if (!cloudRes.ok) {
        toast.error('Erro ao fazer upload da imagem!')
        return
      }

      const avatarUrl = cloudData.secure_url

      const backendRes = await fetch('https://dayflow-production-724d.up.railway.app/auth/avatar', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ avatarUrl })
      })

      if (!backendRes.ok) {
        toast.error('Erro ao salvar avatar!')
        return
      }

      setPreview(avatarUrl)
      onUpdate(avatarUrl)
      localStorage.setItem('avatar', avatarUrl)
      toast.success('Foto atualizada! 🎉')

    } catch {
      toast.error('Erro ao atualizar foto!')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative inline-block">
      <div
        className="w-20 h-20 rounded-full overflow-hidden cursor-pointer group relative"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {uploading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Camera size={20} className="text-white" />
          }
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}