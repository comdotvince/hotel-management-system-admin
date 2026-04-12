const requiredCloudinaryEnvKeys = [
  'VITE_CLOUDINARY_CLOUD_NAME',
  'VITE_CLOUDINARY_UPLOAD_PRESET',
] as const

type RequiredCloudinaryEnvKey = (typeof requiredCloudinaryEnvKeys)[number]

type CloudinaryUploadResponse = {
  secure_url?: unknown
  error?: {
    message?: unknown
  }
}

const getCloudinaryEnvValue = (key: RequiredCloudinaryEnvKey) => {
  if (key === 'VITE_CLOUDINARY_CLOUD_NAME') {
    return import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim() ?? ''
  }

  return import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim() ?? ''
}

const getMissingCloudinaryConfigKeys = () =>
  requiredCloudinaryEnvKeys.filter((key) => !getCloudinaryEnvValue(key))

export const getCloudinaryConfigurationError = () => {
  const missingCloudinaryConfigKeys = getMissingCloudinaryConfigKeys()

  if (!missingCloudinaryConfigKeys.length) {
    return null
  }

  return `Cloudinary setup is incomplete. Add ${missingCloudinaryConfigKeys.join(
    ', '
  )} in your .env file.`
}

const getCloudinaryUploadUrl = () => {
  const cloudName = getCloudinaryEnvValue('VITE_CLOUDINARY_CLOUD_NAME')
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded.')
  }

  const cloudinaryConfigurationError = getCloudinaryConfigurationError()

  if (cloudinaryConfigurationError) {
    throw new Error(cloudinaryConfigurationError)
  }

  const uploadPreset = getCloudinaryEnvValue('VITE_CLOUDINARY_UPLOAD_PRESET')
  const uploadFolder = import.meta.env.VITE_CLOUDINARY_FOLDER?.trim()

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  if (uploadFolder) {
    formData.append('folder', uploadFolder)
  }

  const response = await fetch(getCloudinaryUploadUrl(), {
    method: 'POST',
    body: formData,
  })

  const data = (await response.json().catch(() => null)) as
    | CloudinaryUploadResponse
    | null

  if (!response.ok) {
    const cloudinaryErrorMessage =
      typeof data?.error?.message === 'string' && data.error.message.trim()
        ? data.error.message
        : 'Cloudinary upload failed.'

    throw new Error(cloudinaryErrorMessage)
  }

  if (typeof data?.secure_url !== 'string' || !data.secure_url.trim()) {
    throw new Error('Cloudinary upload finished but no image URL was returned.')
  }

  return data.secure_url
}
