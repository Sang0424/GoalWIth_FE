import { useMutation } from '@tanstack/react-query';
import instance from '../axiosInterceptor';

export const peerRequest = ({ peerId }: { peerId: string }) => {
  const { mutate } = useMutation({
    mutationFn: () => instance.post(`/users/peerRequest`, { peerId }),
  });
  mutate();
};

export default peerRequest;
