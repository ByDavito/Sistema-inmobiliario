// Simulación de API de obras

// Obras asociadas a usuarios (mock básico)
const userWorks = {
  '2': [  // user@test.com
    {
      id: '1',
      userId: '2',
      name: 'Edificio Residencial',
      description: 'Proyecto de edificio residencial en Buenos Aires',
      cityId: '1',
      neighborhood: 'Palermo',
      lng: -58.381636, lat: -34.603707,
      status: 'ACTIVE',
      propertyType: 'edificio',
      coveredSurface: 500,
      totalSurface: 800,
      bedrooms: 8,
      bathrooms: 4,
      hasPatio: false,
      hasGarage: true,
      images: [
        { id: 'img1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', order: 0 },
        { id: 'img2', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', order: 1 }
      ]
    },
    {
      id: '2',
      userId: '2',
      name: 'Casa Familiar',
      description: 'Casa familiar en Córdoba',
      cityId: '2',
      neighborhood: 'Cerro de las Rosas',
      lng: -64.1888, lat: -31.4201,
      status: 'ACTIVE',
      propertyType: 'casa',
      coveredSurface: 150,
      totalSurface: 300,
      bedrooms: 3,
      bathrooms: 2,
      hasPatio: true,
      hasGarage: true,
      images: [
        { id: 'img3', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400', order: 0 },
        { id: 'img4', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400', order: 1 }
      ]
    },
  ],
  '4': [  // juan@test.com
    {
      id: '3',
      userId: '4',
      name: 'Local Comercial',
      description: 'Local comercial en Rosario',
      cityId: '3',
      neighborhood: 'Centro',
      lng: -60.6393, lat: -32.9468,
      status: 'ACTIVE',
      propertyType: 'local',
      coveredSurface: 80,
      totalSurface: 80,
      bedrooms: 0,
      bathrooms: 1,
      hasPatio: false,
      hasGarage: false,
      images: [
        { id: 'img5', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', order: 0 },
        { id: 'img6', url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400', order: 1 }
      ]
    },
  ],
  '5': [  // maria@test.com
    {
      id: '4',
      userId: '5',
      name: 'Oficinas Corporativas',
      description: 'Oficinas corporativas en Buenos Aires',
      cityId: '1',
      neighborhood: 'Puerto Madero',
      lng: -58.4, lat: -34.62,
      status: 'ACTIVE',
      propertyType: 'oficina',
      coveredSurface: 200,
      totalSurface: 200,
      bedrooms: 0,
      bathrooms: 2,
      hasPatio: false,
      hasGarage: true,
      images: [
        { id: 'img7', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400', order: 0 },
        { id: 'img8', url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400', order: 1 }
      ]
    },
  ],
}

let nextId = 5

export const worksService = {
  async getByUserId(userId) {
    await new Promise(resolve => setTimeout(resolve, 300))
    return userWorks[userId] ? [...userWorks[userId]] : []
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    for (const userId in userWorks) {
      const work = userWorks[userId].find(w => w.id === id)
      if (work) return { ...work }
    }
    throw new Error('Obra no encontrada')
  },

  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newWork = {
      id: String(nextId++),
      userId: data.userId,
      name: data.name,
      description: data.description,
      cityId: data.cityId,
      neighborhood: data.neighborhood || '',
      lng: data.lng,
      lat: data.lat,
      status: data.status || 'ACTIVE',
      propertyType: data.propertyType,
      coveredSurface: data.coveredSurface,
      totalSurface: data.totalSurface,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      hasPatio: data.hasPatio || false,
      hasGarage: data.hasGarage || false,
      images: data.images ? data.images.map((img, idx) => ({
        id: img.id || `img_${Date.now()}_${idx}`,
        url: img.preview || '',
        order: idx
      })) : [],
    }

    if (!userWorks[data.userId]) {
      userWorks[data.userId] = []
    }
    userWorks[data.userId].push(newWork)

    return { ...newWork }
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    for (const userId in userWorks) {
      const index = userWorks[userId].findIndex(w => w.id === id)
      if (index !== -1) {
        userWorks[userId][index] = { 
          ...userWorks[userId][index], 
          ...data,
          id, // Mantener el ID original
          userId: userWorks[userId][index].userId // Mantener el userId original
        }
        return { ...userWorks[userId][index] }
      }
    }
    throw new Error('Obra no encontrada')
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    for (const userId in userWorks) {
      const index = userWorks[userId].findIndex(w => w.id === id)
      if (index !== -1) {
        userWorks[userId].splice(index, 1)
        return { success: true }
      }
    }
    throw new Error('Obra no encontrada')
  },

  async getWorksByCity(userId, cityId) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const works = userWorks[userId] || []
    return works.filter(w => w.cityId === cityId)
  },
}
