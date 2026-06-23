import { NextRequest, NextResponse } from 'next/server';
import { fetchBibleBooks } from '@/lib/bible/api';

/**
 * GET /api/bible/books
 * Retorna livros paginados da Bíblia Digital
 * 
 * Query params:
 * - page: número da página (default: 0)
 * - limit: itens por página (default: 10, max: 50)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '10'),
      50
    );

    // Fetch todos os livros (será cacheado pelo React Query)
    const allBooks = await fetchBibleBooks();

    // Paginar
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const books = allBooks.slice(startIndex, endIndex);

    return NextResponse.json({
      books,
      page,
      limit,
      total: allBooks.length,
      hasMore: endIndex < allBooks.length,
    });
  } catch (error) {
    console.error('Error fetching Bible books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
