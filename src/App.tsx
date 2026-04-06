import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  Heart,
  MessageCircle,
  Music2,
  Pause,
  Play,
  Shield,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

type Comment = {
  id: string;
  username: string;
  avatar: string;
  text: string;
  createdAt: string;
};

type Photo = {
  id: string;
  title: string;
  imageUrl: string;
  likes: number;
  views: number;
  comments: Comment[];
  createdAt: string;
};

type MusicTrack = {
  id: string;
  name: string;
  url: string;
};

const STORAGE_KEY = 'xax-state-v1';
const ADMIN_PASSWORD = 'xax-admin-2026';
const HERO_SNAKE_IMAGE =
  'https://images.unsplash.com/photo-1531386151447-fd76ad50012f?auto=format&fit=crop&w=1600&q=80';

type StoredState = {
  photos: Photo[];
  tracks: MusicTrack[];
  selectedTrackId: string;
};

const initialPhotos: Photo[] = [
  {
    id: 'p-1',
    title: 'Crimson Gaze',
    imageUrl:
      'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?auto=format&fit=crop&w=1200&q=80',
    likes: 214,
    views: 1820,
    createdAt: new Date().toISOString(),
    comments: [
      {
        id: 'c-1',
        username: 'Nyx',
        avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Nyx',
        text: 'This glow is unreal 🔥',
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'p-2',
    title: 'Obsidian Coil',
    imageUrl:
      'https://images.unsplash.com/photo-1538428494232-9c0f8a6f2e06?auto=format&fit=crop&w=1200&q=80',
    likes: 128,
    views: 995,
    createdAt: new Date().toISOString(),
    comments: [],
  },
];

const initialTracks: MusicTrack[] = [
  {
    id: 'm-1',
    name: 'Dark Ambient Pulse',
    url: 'https://cdn.pixabay.com/download/audio/2022/02/10/audio_0f6f3b4e39.mp3?filename=dark-ambient-110843.mp3',
  },
];

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function loadState(): StoredState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { photos: initialPhotos, tracks: initialTracks, selectedTrackId: initialTracks[0].id };
  }

  try {
    const parsed = JSON.parse(raw) as StoredState;
    if (!parsed.photos?.length || !parsed.tracks?.length || !parsed.selectedTrackId) {
      return { photos: initialPhotos, tracks: initialTracks, selectedTrackId: initialTracks[0].id };
    }

    return parsed;
  } catch {
    return { photos: initialPhotos, tracks: initialTracks, selectedTrackId: initialTracks[0].id };
  }
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cursor, setCursor] = useState({ x: -200, y: -200 });
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [musicOn, setMusicOn] = useState(true);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState('');
  const [previewPhotoId, setPreviewPhotoId] = useState<string | null>(null);

  const [photoTitle, setPhotoTitle] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [trackName, setTrackName] = useState('');
  const [trackUrl, setTrackUrl] = useState('');
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1700);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const state = loadState();
    setPhotos(state.photos);
    setTracks(state.tracks);
    setSelectedTrackId(state.selectedTrackId);
  }, []);

  useEffect(() => {
    if (!tracks.length || !selectedTrackId) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        photos,
        tracks,
        selectedTrackId,
      }),
    );
  }, [photos, tracks, selectedTrackId]);

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedTrackId) ?? tracks[0],
    [tracks, selectedTrackId],
  );

  useEffect(() => {
    if (!selectedTrack) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = selectedTrack.url;
    audio.loop = true;
    audio.volume = 0;

    if (musicOn) {
      void audio.play().catch(() => undefined);
      fadeAudio(audio, 0.25);
    }
  }, [selectedTrack, musicOn]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
      setParallaxOffset({ x: (event.clientX - window.innerWidth / 2) / 50, y: event.clientY / 80 });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (musicOn) {
      fadeAudio(audio, 0, () => {
        audio.pause();
        setMusicOn(false);
      });
      return;
    }

    void audio.play().catch(() => undefined);
    setMusicOn(true);
    fadeAudio(audio, 0.25);
  };

  const loginAdmin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminPassword('');
    }
  };

  const addPhoto = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin || !photoTitle.trim() || !photoUrl.trim()) {
      return;
    }

    setPhotos((prev) => [
      {
        id: crypto.randomUUID(),
        title: photoTitle.trim(),
        imageUrl: photoUrl.trim(),
        likes: 0,
        views: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setPhotoTitle('');
    setPhotoUrl('');
  };

  const addTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAdmin || !trackName.trim() || !trackUrl.trim()) {
      return;
    }

    const newTrack = {
      id: crypto.randomUUID(),
      name: trackName.trim(),
      url: trackUrl.trim(),
    };

    setTracks((prev) => [newTrack, ...prev]);
    setSelectedTrackId(newTrack.id);
    setTrackName('');
    setTrackUrl('');
  };

  const deleteTrack = (id: string) => {
    if (!isAdmin || tracks.length === 1) {
      return;
    }

    const updated = tracks.filter((track) => track.id !== id);
    setTracks(updated);
    if (id === selectedTrackId) {
      setSelectedTrackId(updated[0].id);
    }
  };

  const openPreview = (id: string) => {
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, views: photo.views + 1 } : photo)));
    setPreviewPhotoId(id);
  };

  const likePhoto = (id: string) => {
    setPhotos((prev) => prev.map((photo) => (photo.id === id ? { ...photo, likes: photo.likes + 1 } : photo)));
  };

  const addComment = (photoId: string) => {
    const text = (commentDraft[photoId] ?? '').trim();
    if (!text) {
      return;
    }

    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId
          ? {
              ...photo,
              comments: [
                {
                  id: crypto.randomUUID(),
                  username: 'Guest',
                  avatar: 'https://api.dicebear.com/9.x/bottts/svg?seed=Guest',
                  text,
                  createdAt: new Date().toISOString(),
                },
                ...photo.comments,
              ],
            }
          : photo,
      ),
    );

    setCommentDraft((prev) => ({ ...prev, [photoId]: '' }));
  };

  const deleteComment = (photoId: string, commentId: string) => {
    if (!isAdmin) {
      return;
    }

    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId
          ? { ...photo, comments: photo.comments.filter((comment) => comment.id !== commentId) }
          : photo,
      ),
    );
  };

  const previewPhoto = photos.find((photo) => photo.id === previewPhotoId) ?? null;
  const totalLikes = photos.reduce((sum, photo) => sum + photo.likes, 0);
  const totalViews = photos.reduce((sum, photo) => sum + photo.views, 0);
  const totalComments = photos.reduce((sum, photo) => sum + photo.comments.length, 0);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p className="loading-logo">XaX</p>
        <p className="loading-text">Calibrating the serpent eye…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <audio ref={audioRef} preload="auto" />
      <div className="cursor-glow" style={{ left: cursor.x, top: cursor.y }} />
      <div className="smoke-bg" />

      <header className="top-bar">
        <h1>XaX</h1>
        <button className="music-btn" onClick={toggleMusic}>
          <Music2 size={16} /> {musicOn ? 'Music ON' : 'Music OFF'} {musicOn ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </header>

      <section className="hero" style={{ transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)` }}>
        <img src={HERO_SNAKE_IMAGE} alt="Black snake with glowing red eyes" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">Cinematic • Mysterious • Premium</p>
          <h2>The Eye of XaX</h2>
          <p>Enter an ultra-dark gallery where every frame glows in crimson neon and motion breathes in the shadows.</p>
        </div>
      </section>

      <section className="analytics">
        <article><Heart size={16} /> {totalLikes} Likes</article>
        <article><Eye size={16} /> {totalViews} Views</article>
        <article><MessageCircle size={16} /> {totalComments} Comments</article>
      </section>

      <section className="gallery-grid">
        {photos.map((photo) => (
          <article key={photo.id} className="photo-card">
            <button className="photo-trigger" onClick={() => openPreview(photo.id)}>
              <img src={photo.imageUrl} alt={photo.title} loading="lazy" />
              <div className="photo-title">{photo.title}</div>
            </button>

            <div className="photo-actions">
              <button onClick={() => likePhoto(photo.id)}><Heart size={15} /> {photo.likes}</button>
              <span><Eye size={15} /> {photo.views}</span>
              <span><MessageCircle size={15} /> {photo.comments.length}</span>
            </div>

            <div className="comment-box">
              <input
                placeholder="Drop a comment..."
                value={commentDraft[photo.id] ?? ''}
                onChange={(event) =>
                  setCommentDraft((prev) => ({
                    ...prev,
                    [photo.id]: event.target.value,
                  }))
                }
              />
              <button onClick={() => addComment(photo.id)}>Post</button>
            </div>

            <div className="comment-list">
              {photo.comments.slice(0, 3).map((comment) => (
                <div key={comment.id} className="comment-item">
                  <img src={comment.avatar} alt={comment.username} />
                  <div>
                    <p>
                      <strong>{comment.username}</strong> · <span>{formatTime(comment.createdAt)}</span>
                    </p>
                    <p>{comment.text}</p>
                  </div>
                  {isAdmin ? (
                    <button className="trash" onClick={() => deleteComment(photo.id, comment.id)}>
                      <Trash2 size={13} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="admin-panel">
        <h3><Shield size={16} /> Admin Panel</h3>

        {!isAdmin ? (
          <form onSubmit={loginAdmin} className="admin-login">
            <input
              type="password"
              placeholder="Admin password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
            />
            <button type="submit">Secure Login</button>
          </form>
        ) : (
          <div className="admin-tools">
            <form onSubmit={addPhoto}>
              <p>Upload Image</p>
              <input placeholder="Photo title" value={photoTitle} onChange={(event) => setPhotoTitle(event.target.value)} />
              <input placeholder="Image URL" value={photoUrl} onChange={(event) => setPhotoUrl(event.target.value)} />
              <button type="submit"><Upload size={14} /> Add Photo</button>
            </form>

            <form onSubmit={addTrack}>
              <p>Upload Music</p>
              <input placeholder="Track name" value={trackName} onChange={(event) => setTrackName(event.target.value)} />
              <input placeholder="Track URL" value={trackUrl} onChange={(event) => setTrackUrl(event.target.value)} />
              <button type="submit"><Upload size={14} /> Add Track</button>
            </form>

            <div className="track-list">
              <p>Manage Tracks</p>
              {tracks.map((track) => (
                <div key={track.id}>
                  <button onClick={() => setSelectedTrackId(track.id)}>{track.name}</button>
                  <button onClick={() => deleteTrack(track.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="danger-zone">
              <p>Image moderation</p>
              {photos.map((photo) => (
                <div key={photo.id}>
                  <span>{photo.title}</span>
                  <button onClick={() => setPhotos((prev) => prev.filter((item) => item.id !== photo.id))}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {previewPhoto ? (
        <div className="preview-modal" onClick={() => setPreviewPhotoId(null)}>
          <button className="close-btn"><X size={20} /></button>
          <img src={previewPhoto.imageUrl} alt={previewPhoto.title} />
          <p>{previewPhoto.title}</p>
        </div>
      ) : null}
    </div>
  );
}

function fadeAudio(audio: HTMLAudioElement, target: number, onDone?: () => void) {
  const step = target > audio.volume ? 0.02 : -0.02;
  const timer = window.setInterval(() => {
    const next = Number((audio.volume + step).toFixed(2));
    const reached = step > 0 ? next >= target : next <= target;

    if (reached) {
      audio.volume = target;
      window.clearInterval(timer);
      onDone?.();
      return;
    }

    audio.volume = Math.max(0, Math.min(1, next));
  }, 60);
}
