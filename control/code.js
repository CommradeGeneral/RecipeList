////////////////////////////////////////////
// WinCC Unified contract owner — plain classic script, no bundler.
//
// Structure is deliberately identical to the MinTest / MinTestReact controls
// that work in this project: this file runs in <head> before anything else and
// calls WebCC.start at top level with an empty extensions array.
//
// React is NOT involved in the handshake. It mounts afterwards from app.jsx and
// only talks to window.RecipeBridge, so the contract registration path is
// exactly the one already proven to work here. Do not move WebCC.start into a
// module or a React effect.

/**
 * Shared state between this script and the React tree.
 *
 * The `on*` slots are filled in by React once it mounts. The contract methods
 * below read them at call time and fall back to `pending`, so a call arriving
 * before React is ready is replayed rather than lost.
 */
window.RecipeBridge = {
  connected: false,
  // Latest values from the container, applied by React on mount.
  recipesJson: null,
  recipesPerPage: null,
  // Replayed into React when it registers its handlers.
  pending: [],
  onUpdateRecipeList: null,
  onShowPage: null,
  onRecipesPerPage: null,
  onConnected: null
};

function bridgeDispatch(kind, value) {
  var b = window.RecipeBridge;
  var handler = b['on' + kind];
  if (handler) handler(value);
  else b.pending.push({ kind: kind, value: value });
}

function setStatus(msg) {
  var el = document.getElementById('status');
  if (el) el.textContent = msg;
  console.log('[RecipeList] ' + msg);
}

////////////////////////////////////////////
// Initialize the custom control
WebCC.start(
  // callback function; occurs when the connection is done or failed.
  function (result) {
    if (result) {
      window.RecipeBridge.connected = true;
      setStatus('connected');

      // Seed current property values, then subscribe for later changes.
      try {
        var props = WebCC.Properties;
        if (props) {
          window.RecipeBridge.recipesJson = props.RecipeList;
          window.RecipeBridge.recipesPerPage = props.RecipesPerPage;
          bridgeDispatch('UpdateRecipeList', props.RecipeList);
          bridgeDispatch('RecipesPerPage', props.RecipesPerPage);
        }
      } catch (e) {
        console.warn('[RecipeList] property read failed:', e);
      }

      if (WebCC.onPropertyChanged) {
        WebCC.onPropertyChanged.subscribe(function (val) {
          switch (val.key) {
            case 'RecipeList':
              window.RecipeBridge.recipesJson = val.value;
              bridgeDispatch('UpdateRecipeList', val.value);
              break;
            case 'RecipesPerPage':
              if (val.value > 0) {
                window.RecipeBridge.recipesPerPage = val.value;
                bridgeDispatch('RecipesPerPage', val.value);
              }
              break;
          }
        });
      }

      if (window.RecipeBridge.onConnected) window.RecipeBridge.onConnected();
    } else {
      setStatus('connection failed');
    }
  },
  // contract (see also manifest.json)
  {
    // Methods
    methods: {
      UpdateRecipeList: function (recipes) {
        console.log('[RecipeList] UpdateRecipeList called');
        window.RecipeBridge.recipesJson = recipes;
        bridgeDispatch('UpdateRecipeList', recipes);
      },
      ShowPage: function (pageNumber) {
        console.log('[RecipeList] ShowPage called with', pageNumber);
        bridgeDispatch('ShowPage', pageNumber);
      }
    },
    // Events
    events: ['onPressOnItem', 'onPressNewRecipe'],
    // Properties
    properties: {
      RecipeList: '[]',
      RecipesPerPage: 5
    }
  },
  // placeholder to include additional Unified dependencies (not used here)
  [],
  // connection timeout
  10000
);

/** Fire a contract event. Safe to call standalone, where nothing is listening. */
window.RecipeBridge.fire = function (name, payload) {
  try {
    if (window.WebCC && window.WebCC.Events) window.WebCC.Events.fire(name, payload);
  } catch (e) {
    /* standalone: no container */
  }
};
