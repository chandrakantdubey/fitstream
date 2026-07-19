const DB_NAME = 'FitStreamDB'
const DB_VERSION = 1

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      db.createObjectStore('exercises', { keyPath: 'id' })
      db.createObjectStore('workouts', { keyPath: 'id' })
    }
  })
}

export async function saveExercises(exercises) {
  const db = await openDB()
  const tx = db.transaction('exercises', 'readwrite')
  const store = tx.objectStore('exercises')
  exercises.forEach(e => store.put(e))
  return new Promise((resolve) => { tx.oncomplete = resolve })
}

export async function getExercises() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction('exercises', 'readonly')
    const req = tx.objectStore('exercises').getAll()
    req.onsuccess = () => resolve(req.result)
  })
}

export async function saveWorkout(workout) {
  const db = await openDB()
  const tx = db.transaction('workouts', 'readwrite')
  tx.objectStore('workouts').put(workout)
  return new Promise((resolve) => { tx.oncomplete = resolve })
}

export async function getWorkouts() {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction('workouts', 'readonly')
    const req = tx.objectStore('workouts').getAll()
    req.onsuccess = () => resolve(req.result)
  })
}

export async function deleteWorkoutLocal(id) {
  const db = await openDB()
  const tx = db.transaction('workouts', 'readwrite')
  tx.objectStore('workouts').delete(id)
  return new Promise((resolve) => { tx.oncomplete = resolve })
}