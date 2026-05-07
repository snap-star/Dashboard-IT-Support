import type  {MetadataRoute}  from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dashboard IT Support Cabang',
    short_name: 'Dashboard IT Support Cabang',
    description: 'Dashboard IT Support Cabang by Oren',
    start_url: '/',
    display: 'standalone',
    icons: [
      {
        src: './favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    lang: 'en',
  }
}