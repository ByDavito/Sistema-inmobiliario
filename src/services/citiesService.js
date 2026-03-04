// Simulación de API de ciudades

let mockCities = [
  {
    id: '1',
    name: 'Buenos Aires',
    center: [-58.3816, -34.6037],
    bounds: [[-58.5, -34.7], [-58.2, -34.5]],
    zoom: 12,
    minZoom: 10,
    maxZoom: 18,
  },
  {
    id: '2',
    name: 'Córdoba',
    center: [-64.1888, -31.4201],
    bounds: [[-64.3, -31.55], [-64.05, -31.3]],
    zoom: 13,
    minZoom: 10,
    maxZoom: 18,
  },
  {
    id: '3',
    name: 'Rosario',
    center: [-60.6393, -32.9468],
    bounds: [[-60.75, -33.05], [-60.55, -32.85]],
    zoom: 13,
    minZoom: 10,
    maxZoom: 18,
  },
]

let nextId = 4

export const citiesService = {
  async getAll() {
    await new Promise(resolve => setTimeout(resolve, 300))
    return [...mockCities]
  },

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200))
    const city = mockCities.find(c => c.id === id)
    if (!city) throw new Error('Ciudad no encontrada')
    return { ...city }
  },

  async create(data) {
    await new Promise(resolve => setTimeout(resolve, 400))
    const newCity = {
      id: String(nextId++),
      name: data.name,
      center: data.center,
      bounds: data.bounds,
      zoom: data.zoom,
      minZoom: data.minZoom || 10,
      maxZoom: data.maxZoom || 18,
    }
    mockCities.push(newCity)
    return { ...newCity }
  },

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockCities.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Ciudad no encontrada')

    mockCities[index] = { ...mockCities[index], ...data }
    return { ...mockCities[index] }
  },

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockCities.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Ciudad no encontrada')

    mockCities.splice(index, 1)
    return { success: true }
  },
}
