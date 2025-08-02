import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Interests from './Interests';
import * as apiUtils from '../utils/api';
import { useAuthStore } from '../store/authStore';

// Mock the API
vi.mock('../utils/api', () => ({
  api: {
    put: vi.fn(),
  },
}));

// Mock the auth store
const mockUpdateUser = vi.fn();
vi.mock('../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderInterests = () => {
  return render(
    <BrowserRouter>
      <Interests />
    </BrowserRouter>
  );
};

describe('Interests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { 
        id: 'test-user', 
        email: 'test@example.com', 
        interests: ['teknoloji', 'bilim'] 
      },
      updateUser: mockUpdateUser,
      isAuthenticated: true,
    });
  });

  it('should render interests form with predefined categories', () => {
    renderInterests();
    
    expect(screen.getByText('İlgi Alanlarını Seç')).toBeInTheDocument();
    expect(screen.getByText('teknoloji')).toBeInTheDocument();
    expect(screen.getByText('bilim')).toBeInTheDocument();
    expect(screen.getByText('spor')).toBeInTheDocument();
    expect(screen.getByText('sanat')).toBeInTheDocument();
    expect(screen.getByText('sağlık')).toBeInTheDocument();
    expect(screen.getByText('ekonomi')).toBeInTheDocument();
    expect(screen.getByText('eğitim')).toBeInTheDocument();
    expect(screen.getByText('seyahat')).toBeInTheDocument();
  });

  it('should show current user interests as selected', () => {
    renderInterests();
    
    const teknoloji = screen.getByText('teknoloji').closest('button');
    const bilim = screen.getByText('bilim').closest('button');
    const spor = screen.getByText('spor').closest('button');
    
    expect(teknoloji).toHaveClass('bg-blue-600');
    expect(bilim).toHaveClass('bg-blue-600');
    expect(spor).not.toHaveClass('bg-blue-600');
  });

  it('should toggle interest selection when clicked', () => {
    renderInterests();
    
    const spor = screen.getByText('spor').closest('button');
    const teknoloji = screen.getByText('teknoloji').closest('button');
    
    // Select 'spor'
    fireEvent.click(spor!);
    expect(spor).toHaveClass('bg-blue-600');
    
    // Deselect 'teknoloji'
    fireEvent.click(teknoloji!);
    expect(teknoloji).not.toHaveClass('bg-blue-600');
  });

  it('should add custom interest when entered', () => {
    renderInterests();
    
    const input = screen.getByPlaceholderText('Özel ilgi alanı ekle...');
    const addButton = screen.getByText('Ekle');
    
    fireEvent.change(input, { target: { value: 'fotoğrafçılık' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('fotoğrafçılık')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('should not add empty custom interest', () => {
    renderInterests();
    
    const addButton = screen.getByText('Ekle');
    fireEvent.click(addButton);
    
    // Should not add anything
    expect(screen.queryByText('')).not.toBeInTheDocument();
  });

  it('should not add duplicate custom interest', () => {
    renderInterests();
    
    const input = screen.getByPlaceholderText('Özel ilgi alanı ekle...');
    const addButton = screen.getByText('Ekle');
    
    // Try to add existing interest
    fireEvent.change(input, { target: { value: 'teknoloji' } });
    fireEvent.click(addButton);
    
    // Should only have one 'teknoloji' element
    const teknolojiBadges = screen.getAllByText('teknoloji');
    expect(teknolojiBadges).toHaveLength(1);
  });

  it('should remove custom interest when x is clicked', () => {
    renderInterests();
    
    const input = screen.getByPlaceholderText('Özel ilgi alanı ekle...');
    const addButton = screen.getByText('Ekle');
    
    // Add custom interest
    fireEvent.change(input, { target: { value: 'müzik' } });
    fireEvent.click(addButton);
    
    expect(screen.getByText('müzik')).toBeInTheDocument();
    
    // Remove custom interest
    const removeButton = screen.getByText('×');
    fireEvent.click(removeButton);
    
    expect(screen.queryByText('müzik')).not.toBeInTheDocument();
  });

  it('should save interests successfully', async () => {
    vi.mocked(apiUtils.api.put).mockResolvedValue({
      data: { interests: ['teknoloji', 'spor'] }
    });
    
    renderInterests();
    
    // Select 'spor' and deselect 'bilim'
    const spor = screen.getByText('spor').closest('button');
    const bilim = screen.getByText('bilim').closest('button');
    
    fireEvent.click(spor!);
    fireEvent.click(bilim!);
    
    const saveButton = screen.getByText('İlgi Alanlarını Kaydet');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(apiUtils.api.put).toHaveBeenCalledWith('/auth/interests', {
        interests: ['teknoloji', 'spor']
      });
    });
    
    expect(mockUpdateUser).toHaveBeenCalledWith({ interests: ['teknoloji', 'spor'] });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should show error message when save fails', async () => {
    const errorMessage = 'İlgi alanları güncellenirken hata oluştu';
    vi.mocked(apiUtils.api.put).mockRejectedValue({
      response: { data: { message: errorMessage } }
    });
    
    renderInterests();
    
    const saveButton = screen.getByText('İlgi Alanlarını Kaydet');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show loading state during save', async () => {
    vi.mocked(apiUtils.api.put).mockImplementation(() => new Promise(() => {}));
    
    renderInterests();
    
    const saveButton = screen.getByText('İlgi Alanlarını Kaydet');
    fireEvent.click(saveButton);
    
    expect(screen.getByText('Kaydediliyor...')).toBeInTheDocument();
  });

  it('should require at least one interest to save', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { 
        id: 'test-user', 
        email: 'test@example.com', 
        interests: [] 
      },
      updateUser: mockUpdateUser,
      isAuthenticated: true,
    });
    
    renderInterests();
    
    const saveButton = screen.getByText('İlgi Alanlarını Kaydet');
    expect(saveButton).toBeDisabled();
  });
});