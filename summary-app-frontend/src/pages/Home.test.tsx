import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Home from './Home';
import * as apiUtils from '../utils/api';
import { useAuthStore } from '../store/authStore';

// Mock the API
vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock the auth store
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

const mockSummaries = [
  {
    _id: 'summary-1',
    text: 'This is the first summary.',
    keywords: ['tech', 'news'],
    readCount: 10,
    createdAt: '2024-01-01T00:00:00.000Z',
    article: {
      _id: 'article-1',
      title: 'First Article',
      url: 'https://example.com/article1',
      description: 'First article description',
      imageUrl: 'https://example.com/image1.jpg',
      publishedAt: '2024-01-01T00:00:00.000Z',
      source: {
        _id: 'source-1',
        name: 'Tech News',
        url: 'https://technews.com',
      },
    },
  },
  {
    _id: 'summary-2',
    text: 'This is the second summary.',
    keywords: ['science', 'research'],
    readCount: 5,
    createdAt: '2024-01-02T00:00:00.000Z',
    article: {
      _id: 'article-2',
      title: 'Second Article',
      url: 'https://example.com/article2',
      description: 'Second article description',
      publishedAt: '2024-01-02T00:00:00.000Z',
      source: {
        _id: 'source-2',
        name: 'Science Journal',
        url: 'https://sciencejournal.com',
      },
    },
  },
];

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
};

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: 'test-user', email: 'test@example.com', interests: ['tech', 'science'] },
      isAuthenticated: true,
    });
  });

  it('should render loading state initially', () => {
    vi.mocked(apiUtils.api.get).mockImplementation(() => new Promise(() => {}));
    
    renderHome();
    
    expect(screen.getByText('Özetler yükleniyor...')).toBeInTheDocument();
  });

  it('should render summaries when loaded successfully', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: mockSummaries });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('First Article')).toBeInTheDocument();
    });

    expect(screen.getByText('Second Article')).toBeInTheDocument();
    expect(screen.getByText('Tech News')).toBeInTheDocument();
    expect(screen.getByText('Science Journal')).toBeInTheDocument();
    expect(screen.getByText('10 okunma')).toBeInTheDocument();
    expect(screen.getByText('5 okunma')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    const errorMessage = 'Özetler yüklenirken hata oluştu';
    vi.mocked(apiUtils.api.get).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should render empty state when no summaries available', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: [] });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Henüz özet bulunamadı')).toBeInTheDocument();
    });

    expect(screen.getByText('İlgi alanlarınızı güncellemek için buraya tıklayın.')).toBeInTheDocument();
  });

  it('should navigate to summary detail when card is clicked', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: mockSummaries });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('First Article')).toBeInTheDocument();
    });

    const firstSummaryCard = screen.getByText('First Article').closest('div[class*="cursor-pointer"]');
    if (firstSummaryCard) {
      fireEvent.click(firstSummaryCard);
      expect(mockNavigate).toHaveBeenCalledWith('/summary/summary-1');
    }
  });

  it('should navigate to interests page when interests link is clicked', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: [] });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Henüz özet bulunamadı')).toBeInTheDocument();
    });

    const interestsLink = screen.getByText('İlgi alanlarınızı güncellemek için buraya tıklayın.');
    fireEvent.click(interestsLink);
    expect(mockNavigate).toHaveBeenCalledWith('/interests');
  });

  it('should render article image when provided', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: mockSummaries });
    
    renderHome();
    
    await waitFor(() => {
      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[0]).toHaveAttribute('alt', 'First Article');
    });
  });

  it('should not render image when not provided', async () => {
    const summariesWithoutImage = [
      {
        ...mockSummaries[1],
        article: {
          ...mockSummaries[1].article,
          imageUrl: undefined,
        },
      },
    ];
    
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: summariesWithoutImage });
    
    renderHome();
    
    await waitFor(() => {
      expect(screen.getByText('Second Article')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});