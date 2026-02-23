import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { GiphyService } from '../../services/giphy.service';
import { GifListItem } from "../../components/gif-list-item/gif-list-item";

@Component({
  selector: 'app-trending',
  imports: [GifListItem],
  templateUrl: './trending.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Trending {
  gifService = inject(GiphyService);
  // gifs = computed(() => this.gifService.trendingGifs())
 }
