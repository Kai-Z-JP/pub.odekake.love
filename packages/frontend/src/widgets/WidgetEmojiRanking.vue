<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :showHeader="widgetProps.showHeader" data-cy-mkw-emojiRanking class="mkw-emojiRanking">
	<template #icon><i class="ti ti-chart-bar"></i></template>
	<template #header>{{ i18n.ts._widgets.emojiRanking }}</template>
	<template #func="{ buttonStyleClass }">
		<button class="_button" :class="buttonStyleClass" @click="configure()"><i class="ti ti-settings"></i></button>
	</template>

	<div class="wgzasxop">
		<MkLoading v-if="fetching"/>
		<div v-else-if="ranking.length === 0" class="empty">{{ i18n.ts.noResults }}</div>
		<div v-else class="list">
			<div v-for="(item, i) in ranking" :key="item.reaction" class="item">
				<span class="rank">{{ i + 1 }}</span>
				<MkReactionIcon :reaction="item.reaction" class="emoji"/>
				<span class="count">{{ item.count }}</span>
			</div>
		</div>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useInterval } from '@@/js/use-interval.js';
import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { FormWithDefault, GetFormResultType } from '@/utility/form.js';
import MkContainer from '@/components/MkContainer.vue';
import MkReactionIcon from '@/components/MkReactionIcon.vue';
import { misskeyApiGet } from '@/utility/misskey-api.js';
import { i18n } from '@/i18n.js';

const name = 'emojiRanking';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean' as const,
		label: i18n.ts._widgetOptions.showHeader,
		default: true,
	},
	limit: {
		type: 'number' as const,
		label: 'Limit',
		default: 10,
	},
	period: {
		type: 'enum' as const,
		label: i18n.ts._widgets._emojiRanking.period,
		default: 'all' as const,
		enum: [
			{ label: i18n.ts._widgets._emojiRanking.periodAll, value: 'all' as const },
			{ label: i18n.ts._widgets._emojiRanking.period1h, value: '1h' as const },
			{ label: i18n.ts._widgets._emojiRanking.period24h, value: '24h' as const },
			{ label: i18n.ts._widgets._emojiRanking.period7d, value: '7d' as const },
			{ label: i18n.ts._widgets._emojiRanking.period30d, value: '30d' as const },
		],
	},
} satisfies FormWithDefault;

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

const widgetId = props.widget?.id ?? null;

const ranking = ref<{ reaction: string; count: number }[]>([]);
const fetching = ref(true);

const loadRanking = () => {
	misskeyApiGet('notes/reactions-ranking', {
		limit: widgetProps.limit,
		period: widgetProps.period,
	}).then(res => {
		ranking.value = res;
		fetching.value = false;
	});
};

useInterval(loadRanking, 1000 * 60, {
	immediate: true,
	afterMounted: true,
});

watch(() => [widgetProps.period, widgetProps.limit], () => {
	loadRanking();
});

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: widgetId,
});
</script>

<style lang="scss" scoped>
.wgzasxop {
	padding: 8px 16px;

	> .empty {
		padding: 16px 0;
		text-align: center;
		opacity: 0.7;
		font-size: 0.9em;
	}

	> .list {
		> .item {
			display: flex;
			align-items: center;
			gap: 8px;
			padding: 6px 0;
			border-bottom: solid 0.5px var(--MI_THEME-divider);

			&:last-child {
				border-bottom: none;
			}

			> .rank {
				width: 24px;
				text-align: right;
				font-size: 0.85em;
				opacity: 0.6;
				flex-shrink: 0;
			}

			> .emoji {
				font-size: 1.6em;
				flex-shrink: 0;
			}

			> .count {
				margin-left: auto;
				font-size: 0.9em;
				opacity: 0.8;
			}
		}
	}
}
</style>
