import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { BusinessSettings, OpeningHours, Service, GalleryItem, Review, FAQ } from '../types';

export function useBusiness() {
  return useQuery({
    queryKey: ['business'],
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const { data } = await api.get('/business');
      return data.data as BusinessSettings;
    },
  });
}

export function useOpeningHours() {
  return useQuery({
    queryKey: ['opening-hours'],
    queryFn: async () => {
      const { data } = await api.get('/opening-hours');
      return data.data as OpeningHours;
    },
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get('/services');
      return data.data as Service[];
    },
  });
}

export function useGallery() {
  return useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const { data } = await api.get('/gallery');
      return data.data as GalleryItem[];
    },
  });
}

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const { data } = await api.get('/reviews');
      return data.data as Review[];
    },
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async () => {
      const { data } = await api.get('/faqs');
      return data.data as FAQ[];
    },
  });
}
