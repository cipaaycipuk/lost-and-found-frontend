// import { useState } from 'react'
import GradientBlinds from './GradientBlinds'
// import GridDistortion from './GridDistortion'
import Logo from './Logo'

// const BACKGROUND_OPTIONS = [
//   { id: 'blinds', label: 'Gradient Blinds' },
//   { id: 'grid', label: 'Grid Distortion' },
// ]

export default function AuthLayout({ title, subtitle, children }) {
  // const [bgMode, setBgMode] = useState(() => {
  //   return localStorage.getItem('auth_bg_mode') || 'blinds'
  // })

  // const handleSelectBg = (mode) => {
  //   setBgMode(mode)
  //   localStorage.setItem('auth_bg_mode', mode)
  // }

  return (
    // Outer Container
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-0 lg:p-10">
      
      {/* Floating Card: Menggunakan min-h-[640px] & h-auto agar fleksibel saat ada pesan error */}
      <div className="w-full min-h-screen bg-page px-6 py-8 flex flex-col justify-center lg:min-h-[640px] lg:h-auto lg:max-w-4xl lg:bg-white lg:rounded-[18px] lg:shadow-2xl lg:shadow-black/10 lg:border lg:border-gray-100 lg:p-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-stretch">
        
        {/* Panel Gambar Kiri: Mendukung dua opsi efek interaktif (GradientBlinds & GridDistortion) */}
        <aside className="relative hidden min-h-[580px] w-full flex-col justify-between overflow-hidden rounded-xl bg-black p-8 lg:flex">
          <div className="absolute inset-0">
            {/* {bgMode === 'grid' ? (
              <GridDistortion
                imageSrc="/gradient.png"
                grid={15}
                radius={0.22}
                strength={0.18}
                relaxation={0.95}
                softness={0.35}
                chroma={0.25}
                idle={0.3}
                clickRipple
                intro
              />
            ) : (
              
            )} */}
            <GradientBlinds
                gradientColors={['#e0531c', '#001994', '#111827']}
                angle={0}
                noise={0.25}
                blindCount={14}
                blindMinWidth={40}
                spotlightRadius={0.55}
                spotlightSoftness={1.1}
                spotlightOpacity={0.95}
                distortAmount={0.15}
                mouseDampening={0.15}
                shineDirection="left"
              />
          </div>

          <h2 className="pointer-events-none relative z-10 max-w-xs text-3xl font-medium leading-tight text-white xl:text-4xl">
            Helping lost things find their way back home.
          </h2>

          {/* Switcher 2 opsi efek background */}
          {/* <div className="relative z-10 inline-flex w-fit items-center gap-1 rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-md">
            {BACKGROUND_OPTIONS.map((opt) => {
              const active = bgMode === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectBg(opt.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    active
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div> */}
        </aside>

        {/* Form Area */}
        <main className="w-full max-w-sm mx-auto flex flex-col justify-center lg:max-w-none lg:px-4 lg:py-2">
          <Logo className="justify-center lg:justify-start" />

          <div className="mt-6 lg:mt-5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 lg:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          </div>

          <div className="mt-5">{children}</div>
        </main>

      </div>
    </div>
  )
}