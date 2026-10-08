<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep runway selection local to AircraftMap and derive the overlay from existing runway props; this preserves the existing airport data flow without extra requests.
- Manage runway sweep animation in runwayLayers with explicit cleanup and reduced-motion support; this keeps map effects independent of React renders.
