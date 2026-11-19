export const currentUser = {
  id: 1,
  name: 'Syifa Nur Aini',
  email: 'syifa.aini@widyatama.ac.id',
  whatsapp: '0813 1212 3476',
  avatar: '/users/emily.jpg',
}

export const INITIAL_POSTS = [
  {
    id: 1,
    author: {
      id: 2,
      name: 'Rony Parulian',
      email: 'rony.parulian@widyatama.ac.id',
      whatsapp: '0813 1212 3476',
      avatar: '/users/rony.jpg',
    },
    type: 'kehilangan',
    status: 'open',
    image: '/posts-img/tumbler.jpg',
    title: 'Tumbler Minum Motif Leopard',
    location: 'Foodcourt / Kantin',
    incident_date: '2026-09-10',
    category: 'Lainnya',
    description:
      'Dicari tumbler dengan motif leopard warna cokelat hitam. Terakhir diletakkan di meja dekat tangga Gedung B lt. 406 setelah kelas pagi.',
    comments_count: 2,
    is_saved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
  },
  {
    id: 2,
    author: {
      id: 3,
      name: 'Alyssa Putri',
      email: 'alyssa.putri@widyatama.ac.id',
      whatsapp: '0821 9876 5432',
      avatar: '/users/alyssa.jpg',
    },
    type: 'ditemukan',
    status: 'open',
    image: '/posts-img/guitar.jpg',
    title: 'Gitar Akustik Cokelat + Softcase Hitam',
    location: 'Gedung A',
    incident_date: '2026-09-09',
    category: 'Lainnya',
    description:
      'Ditemukan gitar akustik di ruang tunggu lobi Gedung A sekitar pukul 16.30 WIB. Saat ini dititipkan ke satpam pos utama.',
    comments_count: 1,
    is_saved: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 3,
    author: currentUser,
    type: 'kehilangan',
    status: 'open',
    image: '/posts-img/imusic.jpg',
    title: 'iPhone / Pemutar Musik Hitam',
    location: 'Perpustakaan',
    incident_date: '2026-09-08',
    category: 'Elektronik',
    description:
      'Tertinggal di meja baca lantai 2 Perpustakaan area dekat colokan listrik. Casing bening dengan stiker kecil di bagian belakang.',
    comments_count: 0,
    is_saved: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
  },
]

export const INITIAL_COMMENTS = {
  1: [
    {
      id: 101,
      post_id: 1,
      parent_id: null,
      user: 'Agatha Chelsea',
      avatar: '/users/emily.jpg',
      text: 'Tadi sempat lihat di dekat dispenser lantai 4 kak, coba cek ke satpam lantai 1.',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 102,
      post_id: 1,
      parent_id: 101,
      user: 'Rony Parulian',
      avatar: '/users/rony.jpg',
      text: 'Siap makasih infonya kak! Otw cek ke pos satpam.',
      isReply: true,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  2: [
    {
      id: 103,
      post_id: 2,
      parent_id: null,
      user: 'Syifa Nur Aini',
      avatar: '/users/emily.jpg',
      text: 'Keren banget langsung diamankan ke pos satpam. Semoga cepat ketemu pemiliknya.',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
}

export const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    type: 'comment',
    postId: 1,
    message: 'Agatha Chelsea mengomentari laporan "Tumbler Minum Motif Leopard"',
    timeAgo: '10 menit yang lalu',
    isRead: false,
  },
  {
    id: 2,
    type: 'status_update',
    postId: 2,
    message: 'Laporan baru ditemukan di Gedung A yang mungkin sesuai.',
    timeAgo: '3 jam yang lalu',
    isRead: true,
  },
]

export const myPosts = INITIAL_POSTS.filter((p) => p.author.id === currentUser.id)
export const savedPosts = INITIAL_POSTS.filter((p) => p.is_saved)
