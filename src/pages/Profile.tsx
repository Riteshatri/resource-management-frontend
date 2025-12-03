import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const name =
      (user as any)?.displayName ||
      (user as any)?.display_name ||
      '';
    const userBio = (user as any)?.bio || '';
    setDisplayName(name);
    setBio(userBio);
  }, [user]);

  const save = async () => {
    setLoading(true);
    try {
      await api.updateProfile({ displayName, bio });
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Profile</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Display Name</label>
          <input
            className="border p-2 w-full rounded"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            className="border p-2 w-full rounded"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={save}
            disabled={loading}
            className="bg-gradient-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
