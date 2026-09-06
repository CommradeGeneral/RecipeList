/**
 * Recipe list UI.
 *
 * Owns no part of the WebCC handshake — code.js does that in <head> before this
 * module is parsed. React only subscribes to window.RecipeBridge, so adding a
 * framework cannot affect contract registration.
 */
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import 'overlayscrollbars/styles/overlayscrollbars.css'
import './index.css'
import './App.css'
import { ButtonPrimary } from './components/misc/ButtonPrimary/ButtonPrimary.jsx'
import { SearchInput } from './components/misc/SearchInput/SearchInput.jsx'
import { RecipeListItem } from './components/misc/RecipeListItem/RecipeListItem.jsx'
import { Navigation } from './components/misc/Navigation/Navigation.jsx'

/** Shown until the container pushes a RecipeList, and standalone in the browser. */
const dummyData = Array.from({ length: 30 }, (_, i) => {
  const n = i + 1
  const code = n <= 26
    ? String.fromCharCode(65 + i)
    : 'A' + String.fromCharCode(65 + i - 26)
  return {
    code,
    name: `Recipe ${code}`,
    id: String(n),
    createdBy: 'El-king dot com',
    status: n % 3 !== 0,
  }
})

/** Tolerates an array, a JSON array string, or junk (which yields null). */
function parseRecipes(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

function App() {
  const bridge = window.RecipeBridge

  const [recipes, setRecipes] = useState(dummyData)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredRecipes = recipes.filter((recipe) =>
    String(recipe.name).toLowerCase().includes(searchTerm.trim().toLowerCase()),
  )
  const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / itemsPerPage))
  // itemsPerPage can grow from the HMI side and strand us past the last page.
  const safePage = Math.min(currentPage, totalPages)
  const firstItemIndex = (safePage - 1) * itemsPerPage
  const visibleRecipes = filteredRecipes.slice(firstItemIndex, firstItemIndex + itemsPerPage)

  useEffect(() => {
    if (!bridge) return

    bridge.onUpdateRecipeList = (raw) => {
      const parsed = parseRecipes(raw)
      if (parsed) {
        setRecipes(parsed)
        setCurrentPage(1)
      }
    }

    bridge.onRecipesPerPage = (value) => {
      const n = Number(value)
      if (Number.isFinite(n) && n > 0) {
        setItemsPerPage(n)
        setCurrentPage(1)
      }
    }

    bridge.onShowPage = (value) => {
      const n = Number(value)
      if (Number.isFinite(n) && n >= 1) setCurrentPage(Math.floor(n))
    }

    // Replay anything the container sent before this effect ran.
    const queued = bridge.pending.splice(0, bridge.pending.length)
    queued.forEach(({ kind, value }) => bridge['on' + kind]?.(value))

    return () => {
      bridge.onUpdateRecipeList = null
      bridge.onRecipesPerPage = null
      bridge.onShowPage = null
    }
  }, [bridge])

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="app">
      <div
        style={{
          border: '4px solid #d5d5d5',
          borderRadius: '8px',
          height: '100%',
          padding: '10px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          className="title"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            flex: '0 0 auto',
            fontSize: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>RECIPE LIST</div>
            <ButtonPrimary
              className="button-primary"
              onClick={() => bridge?.fire?.('onPressNewRecipe', {})}
            >
              <span> + </span>
              New Recipe
            </ButtonPrimary>
          </div>
          <div className="search-bar">
            <SearchInput value={searchTerm} onChange={handleSearchChange} />
          </div>
        </div>

        <OverlayScrollbarsComponent
          className="recipe-list-scroll"
          options={{
            overflow: { x: 'hidden', y: 'scroll' },
            scrollbars: {
              visibility: 'auto',
              autoHide: 'move',
              clickScroll: true,
              dragScroll: true,
              autoHideDelay: 500,
            },
          }}
        >
          <div className="recipe-list">
            {visibleRecipes.map((recipe, i) => (
              <RecipeListItem
                key={recipe.id ?? i}
                {...recipe}
                onClick={() => {
                  // Index within the full filtered list, not just this page.
                  bridge?.fire?.('onPressOnItem', firstItemIndex + i)
                }}
              />
            ))}
          </div>
        </OverlayScrollbarsComponent>

        <Navigation
          currentPage={safePage}
          totalPages={totalPages}
          onPrevious={() => setCurrentPage((page) => Math.max(1, page - 1))}
          onNext={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
