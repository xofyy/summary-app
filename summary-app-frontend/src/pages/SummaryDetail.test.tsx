import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SummaryDetail from './SummaryDetail';
import * as apiUtils from '../utils/api';

// Mock the API
vi.mock('../utils/api', () => ({
  api: {
    get: vi.fn(),
  },
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: 'test-summary-id' }),
    useNavigate: () => vi.fn(),
  };
});

const mockSummary = {
  _id: 'test-summary-id',
  text: 'This is a test summary of the article.',
  keywords: ['test', 'summary', 'article'],
  readCount: 5,
  createdAt: '2024-01-01T00:00:00.000Z',
  article: {
    _id: 'test-article-id',
    title: 'Test Article Title',
    url: 'https://example.com/article',
    description: 'This is a test article description.',
    imageUrl: 'https://example.com/image.jpg',
    publishedAt: '2024-01-01T00:00:00.000Z',
    source: {
      _id: 'test-source-id',
      name: 'Test Source',
      url: 'https://example.com',
    },
  },
};

const renderSummaryDetail = () => {
  return render(
    <BrowserRouter>
      <SummaryDetail />
    </BrowserRouter>
  );
};

describe('SummaryDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(apiUtils.api.get).mockImplementation(() => new Promise(() => {}));
    
    renderSummaryDetail();
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render summary details when loaded successfully', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: mockSummary });
    
    renderSummaryDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Source')).toBeInTheDocument();
    expect(screen.getByText('This is a test article description.')).toBeInTheDocument();
    expect(screen.getByText('AI Özeti')).toBeInTheDocument();
    expect(screen.getByText('This is a test summary of the article.')).toBeInTheDocument();
    expect(screen.getByText('Anahtar Kelimeler')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('article')).toBeInTheDocument();
    expect(screen.getByText('5 okunma')).toBeInTheDocument();
  });

  it('should render error state when API call fails', async () => {
    const errorMessage = 'Özet yüklenirken hata oluştu';
    vi.mocked(apiUtils.api.get).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });
    
    renderSummaryDetail();
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(screen.getByText('Ana Sayfaya Dön')).toBeInTheDocument();
  });

  it('should render not found state when summary is null', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: null });
    
    renderSummaryDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Özet bulunamadı')).toBeInTheDocument();
    });

    expect(screen.getByText('Ana Sayfaya Dön')).toBeInTheDocument();
  });

  it('should render original article link', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: mockSummary });
    
    renderSummaryDetail();
    
    await waitFor(() => {
      const originalLink = screen.getByRole('link', { name: /Orijinal Makaleyi Oku/i });
      expect(originalLink).toBeInTheDocument();
      expect(originalLink).toHaveAttribute('href', 'https://example.com/article');
      expect(originalLink).toHaveAttribute('target', '_blank');
    });
  });

  it('should render article image when provided', async () => {
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: mockSummary });
    
    renderSummaryDetail();
    
    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
      expect(image).toHaveAttribute('alt', 'Test Article Title');
    });
  });

  it('should not render image when not provided', async () => {
    const summaryWithoutImage = {
      ...mockSummary,
      article: {
        ...mockSummary.article,
        imageUrl: undefined,
      },
    };
    
    vi.mocked(apiUtils.api.get).mockResolvedValue({ data: summaryWithoutImage });
    
    renderSummaryDetail();
    
    await waitFor(() => {
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});