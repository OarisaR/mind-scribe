import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { db } from '../firebase'
import type { MindMapData } from '../App'

export interface SavedMap {
  id: string
  title: string
  data: MindMapData
  originalText: string
  createdAt: string
}

export function useMaps(uid: string | null) {
  const [maps, setMaps] = useState<SavedMap[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setMaps([])
      setLoading(false)
      return
    }

    // Real-time listener — updates automatically when Firestore changes
    const q = query(
      collection(db, 'maps'),
      where('uid', '==', uid),
    //   orderBy('createdAt', 'desc')
    )

    const unsub = onSnapshot(q, snapshot => {
      const loaded: SavedMap[] = snapshot.docs.map(d => {
      const data = d.data()
        return {
            id: d.id,
            title: data.title,
            data: data.data,
            originalText: data.originalText,
            createdAt: data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        }
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setMaps(loaded)
      setLoading(false)
    })

    return () => unsub()
  }, [uid])

  const saveMap = async (data: MindMapData, originalText: string) => {
    if (!uid) return null
    const ref = await addDoc(collection(db, 'maps'), {
      uid,
      title: data.title,
      data,
      originalText,
      createdAt: serverTimestamp(),
    })
    return ref.id
  }

  const deleteMap = async (id: string) => {
    await deleteDoc(doc(db, 'maps', id))
  }

  return { maps, loading, saveMap, deleteMap }
}