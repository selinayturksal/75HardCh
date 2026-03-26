import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export const useProgress = (challengeType: string) => {
  const { user } = useAuth();
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [todayDone, setTodayDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;
    loadProgress();
  }, [user, challengeType]);

  const loadProgress = async () => {
    if (!user) return;
    try {
      const ref = doc(db, 'users', user.uid, 'progress', challengeType);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        const days = data.completedDays || [];
        setCompletedDays(days);
        setTodayDone(days.includes(today));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markToday = async (extraData?: any) => {
    if (!user || todayDone) return;
    const newDays = [...completedDays, today];
    const ref = doc(db, 'users', user.uid, 'progress', challengeType);
    await setDoc(ref, {
      completedDays: newDays,
      lastUpdated: today,
      ...extraData,
    }, { merge: true });
    setCompletedDays(newDays);
    setTodayDone(true);
  };

  const getDayCount = () => completedDays.length;
  const getProgressPercent = () => Math.min((completedDays.length / 75) * 100, 100);

  return { completedDays, todayDone, loading, markToday, getDayCount, getProgressPercent };
};