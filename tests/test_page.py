from html.parser import HTMLParser
from pathlib import Path
import re
import unittest


PROJECT_ROOT = Path(__file__).resolve().parents[1]
INDEX_FILE = PROJECT_ROOT / "index.html"
STYLES_FILE = PROJECT_ROOT / "styles.css"


class PageParser(HTMLParser):
    VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__()
        self.html_lang = None
        self.tags = set()
        self.ids = set()
        self.nav_hrefs = set()
        self.nav_groups = []
        self.stylesheet_hrefs = set()
        self.script_sources = set()
        self.overview_blocks = []
        self.quick_card_count = 0
        self.has_tablist = False
        self.search_container = None
        self.search_label = None
        self.search_input = None
        self.search_clear = None
        self.search_status = None
        self.search_results = None
        self.search_inside_tablist = None
        self.brand_href = None
        self.initial_active_tabs = []
        self.initial_active_panels = []
        self.tab_hrefs = set()
        self.tab_order = []
        self.tab_controls = set()
        self.tab_panel_ids = set()
        self.tab_panel_order = []
        self.tab_link_hrefs = set()
        self.protocol_lanes = set()
        self.protocol_examples = set()
        self.http_https_blocks = []
        self.http_methods = set()
        self.supporting_methods = set()
        self.has_method_comparison = False
        self.has_method_table = False
        self.status_families = set()
        self.essential_status_codes = set()
        self.secondary_status_codes = set()
        self.status_comparisons = set()
        self.has_status_flow = False
        self.header_names = set()
        self.header_pairs = set()
        self.cache_states = set()
        self.cache_directives = set()
        self.has_cache_flow = False
        self.has_cache_layers = False
        self.cdn_nodes = set()
        self.cdn_results = set()
        self.cdn_concepts = set()
        self.cdn_controls = set()
        self.cdn_examples = set()
        self.cdn_quick_cards = set()
        self.cdn_layers = []
        self.cdn_cache_groups = set()
        self.cdn_site_modes = set()
        self.cdn_practical_uses = set()
        self.cdn_story_steps = set()
        self.cdn_story_countries = set()
        self.cdn_story_routes = set()
        self.has_cdn_country_story = False
        self.has_cdn_interview_answer = False
        self.has_cdn_route = False
        self.has_cdn_security = False
        self.has_cdn_personalization_warning = False
        self.cookie_layers = []
        self.cookie_key_ideas = set()
        self.cookie_problems = set()
        self.cookie_login_steps = set()
        self.cookie_attributes = set()
        self.cookie_detail_topics = set()
        self.cookie_examples = set()
        self.cookie_related_topics = set()
        self.cors_layers = []
        self.cors_key_ideas = set()
        self.cors_boundaries = set()
        self.cors_solves = set()
        self.cors_does_not_solve = set()
        self.cors_environments = set()
        self.cors_flows = set()
        self.cors_preflight_steps = set()
        self.cors_actors = set()
        self.cors_headers = set()
        self.has_cors_interview_answer = False
        self.csrf_layers = []
        self.csrf_key_ideas = set()
        self.csrf_flow_steps = set()
        self.csrf_examples = set()
        self.csrf_token_steps = set()
        self.csrf_defenses = set()
        self.csrf_limits = set()
        self.csrf_relevance = set()
        self.security_topics = set()
        self.has_security_comparison = False
        self.has_csrf_interview_answer = False
        self.http_version_layers = []
        self.http_version_simple_assets = []
        self.http_version_simple_examples = []
        self.http_version_self_checks = []
        self.http_version_check_answers = []
        self.http_version_layers_inside_details = []
        self.http_versions = set()
        self.http_version_example_versions = set()
        self.http_version_assets = set()
        self.http_version_example_steps = set()
        self.http_version_problems = set()
        self.http_version_solutions = set()
        self.http_version_comparisons = set()
        self.http_version_terms = set()
        self.quic_stack = set()
        self.quic_features = set()
        self.http_version_myths = set()
        self.has_http_version_comparison = False
        self.has_http_versions_interview_answer = False
        self.has_http_version_child_summary = False
        self.http_version_details = []
        self.http_version_details_controls = []
        self.realtime_layers = []
        self.realtime_methods = []
        self.realtime_diagram_count = 0
        self.realtime_animations = set()
        self.realtime_lanes = []
        self.realtime_messages = []
        self.realtime_analogies = set()
        self.realtime_choices = set()
        self.realtime_qualifiers = set()
        self.realtime_detail_topics = set()
        self.realtime_concepts = []
        self.has_realtime_interview_answer = False
        self.dns_layers = []
        self.dns_zones = []
        self.dns_sequence = []
        self.dns_local_sources = []
        self.dns_network_servers = []
        self.dns_resolver_examples = []
        self.dns_branches = set()
        self.dns_handoff = []
        self.dns_answer_parts = set()
        self.dns_visible_nodes = []
        self.dns_simple_calls = []
        self.dns_simple_route_count = 0
        self.dns_qualifiers = set()
        self.dns_records_inside_details = []
        self.dns_diagram_count = 0
        self.dns_details = []
        self.dns_details_controls = []
        self.render_layers = []
        self.render_diagram_count = 0
        self.render_request_steps = []
        self.render_tree_steps = []
        self.render_pipeline_steps = []
        self.render_script_rows = []
        self.render_event_rows = []
        self.render_update_rows = []
        self.render_detail_topics = []
        self.render_qualifiers = set()
        self.render_details = []
        self.render_details_controls = []
        self.event_loop_layers = []
        self.event_loop_diagram_count = 0
        self.event_loop_cycle_steps = []
        self.event_loop_example_steps = []
        self.event_loop_example_output = []
        self.event_loop_concepts = set()
        self.event_loop_solves = set()
        self.event_loop_limits = set()
        self.event_loop_qualifiers = set()
        self.event_loop_async_boundaries = set()
        self.event_loop_detail_topics = []
        self.event_loop_details = []
        self.event_loop_details_controls = []
        self.has_event_loop_interview_answer = False
        self.event_loop_foundation_layers = []
        self.event_loop_runtime_layers = []
        self.event_loop_start_steps = []
        self.event_loop_runtime_branches = set()
        self.browser_loop_layers = []
        self.browser_loop_steps = []
        self.browser_task_sources = set()
        self.browser_microtasks = set()
        self.browser_render_steps = []
        self.browser_worker_parts = set()
        self.browser_loop_qualifiers = set()
        self.browser_loop_details = []
        self.browser_loop_details_controls = []
        self.browser_loop_detail_topics = []
        self.has_browser_loop_interview_answer = False
        self.loop_visuals = []
        self.loop_diagram_svgs = set()
        self.loop_motion_tracks = 0
        self.loop_visual_controls = set()
        self.loop_comparison_tables = 0
        self.loop_environment_order = []
        self.loop_environments = []
        self.loop_visual_layouts = []
        self.browser_visual_steps = []
        self.browser_visual_branches = set()
        self.browser_visual_notes = set()
        self.node_visual_steps = []
        self.node_visual_phases = []
        self.node_loop_layers = []
        self.node_big_picture_steps = []
        self.node_key_points = set()
        self.node_start_steps = []
        self.node_architecture_layers = []
        self.node_loop_phases = []
        self.node_queues = set()
        self.node_async_routes = set()
        self.node_examples = set()
        self.node_qualifiers = set()
        self.node_loop_details = []
        self.node_loop_details_controls = []
        self.node_loop_detail_topics = []
        self.has_node_loop_interview_answer = False
        self.promise_layers = []
        self.promise_definitions = set()
        self.promise_states = []
        self.promise_diagram_count = 0
        self.promise_animations = set()
        self.promise_flow_steps = []
        self.promise_flow_branches = set()
        self.promise_handlers = []
        self.promise_async_await_concepts = set()
        self.promise_execution_modes = set()
        self.promise_combinators = set()
        self.promise_pitfalls = set()
        self.has_promise_interview_answer = False
        self.variable_layers = []
        self.closure_layers = []
        self.closure_solves = []
        self.react_layers = []
        self.react_say = []
        self.react_definitions = []
        self.order_moments = []
        self.order_cards = []
        self.order_bands = []
        self.order_tags = []
        self.react_commit = []
        self.has_react_script = False
        self.react_phases = []
        self.react_rules = []
        self.react_causes = []
        self.rerender_layers = []
        self.rerender_definitions = []
        self.rerender_say = []
        self.rerender_traps = []
        self.stories = []
        self.has_rerender_script = False
        self.memo_layers = []
        self.memo_definitions = []
        self.memo_say = []
        self.memo_facts = []
        self.has_memo_script = False
        self.hooktab_layers = []
        self.hooktab_definitions = []
        self.hooktab_say = []
        self.hooktab_guide = []
        self.has_hooktab_script = False
        self.patterns_layers = []
        self.patterns_definitions = []
        self.patterns_say = []
        self.patterns_guide = []
        self.has_patterns_script = False
        self.statetab_layers = []
        self.statetab_definitions = []
        self.statetab_say = []
        self.statetab_guide = []
        self.has_statetab_script = False
        self.csp_layers = []
        self.csp_directives = []
        self.csp_compare = []
        self.has_csp_interview_answer = False
        self.thistab_layers = []
        self.thistab_say = []
        self.thistab_guide = []
        self.has_thistab_script = False
        self.prototab_layers = []
        self.prototab_say = []
        self.prototab_guide = []
        self.has_prototab_script = False
        self.tstab_layers = []
        self.tstab_say = []
        self.tstab_guide = []
        self.has_tstab_script = False
        self.aitab_layers = []
        self.aitab_say = []
        self.react_nodes = []
        self.react_ops = []
        self.key_demo_lists = []
        self.gc_chains = []
        self.gc_verdicts = []
        self.gc_cuts = 0
        self.variable_cards = []
        self.variable_diagram_count = 0
        self.variable_animations = set()
        self.variable_rooms = []
        self.variable_boxes = set()
        self.variable_decisions = set()
        self.variable_errors = set()
        self.variable_pitfalls = set()
        self.has_variable_interview_answer = False
        self.about_layers = set()
        self.about_proofs = set()
        self.about_chunks = []
        self.about_cases = []
        self.about_followups = []
        self.about_avoid = set()
        self.roadmap_topics = set()
        self.has_cookie_analogy = False
        self.has_cookie_interview_answer = False
        self._inside_nav = False
        self._tablist_depth = None
        self._open_tags = []
        self._overview_depth = None
        self._quick_cards_depth = None
        self._http_https_depth = None
        self._http_version_details_depth = None
        self._dns_details_depth = None
        self._render_details_depth = None
        self._event_loop_details_depth = None
        self._browser_loop_details_depth = None
        self._node_loop_details_depth = None
        self._loop_visual_comparison_depth = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        classes = set(attributes.get("class", "").split())
        self.tags.add(tag)

        if self._overview_depth is not None and len(self._open_tags) == self._overview_depth:
            self.overview_blocks.append(classes)
        if self._quick_cards_depth is not None and tag == "article" and "quick-card" in classes:
            self.quick_card_count += 1
        if self._http_https_depth is not None and len(self._open_tags) == self._http_https_depth:
            for attribute, block_name in (
                ("data-protocol-visual", "protocol-visual"),
                ("data-protocol-examples", "protocol-examples"),
                ("data-protocol-comparison", "protocol-comparison"),
            ):
                if attribute in attributes:
                    self.http_https_blocks.append(block_name)

        if tag == "html":
            self.html_lang = attributes.get("lang")
        if tag == "a" and "brand" in classes:
            self.brand_href = attributes.get("href")
        if element_id := attributes.get("id"):
            self.ids.add(element_id)
        if tag == "nav":
            self._inside_nav = True
        if "data-tablist" in attributes:
            self.has_tablist = True
            self._tablist_depth = len(self._open_tags) + 1
        if nav_group := attributes.get("data-nav-group"):
            self.nav_groups.append((tag, nav_group, "nav-topic" in classes))
        if "data-sidebar-search" in attributes:
            self.search_container = (tag, attributes.get("role"))
            self.search_inside_tablist = self._tablist_depth is not None
        if tag == "label" and "data-search-label" in attributes:
            self.search_label = (tag, attributes.get("for"))
        if "data-search-input" in attributes:
            self.search_input = (
                tag,
                attributes.get("type"),
                attributes.get("role"),
                attributes.get("autocomplete"),
                attributes.get("aria-autocomplete"),
                attributes.get("aria-controls"),
                attributes.get("aria-expanded"),
            )
        if "data-search-clear" in attributes:
            self.search_clear = (tag, attributes.get("type"), "hidden" in attributes)
        if "data-search-status" in attributes:
            self.search_status = (
                tag,
                attributes.get("role"),
                attributes.get("aria-live"),
            )
        if "data-search-results" in attributes:
            self.search_results = (
                tag,
                attributes.get("id"),
                attributes.get("role"),
                "hidden" in attributes,
            )
        if "data-tab" in attributes:
            if href := attributes.get("href"):
                self.tab_hrefs.add(href)
                self.tab_order.append(href)
                if "is-active" in classes:
                    self.initial_active_tabs.append(href)
            if controls := attributes.get("aria-controls"):
                self.tab_controls.add(controls)
        if "data-tab-panel" in attributes and (panel_id := attributes.get("id")):
            self.tab_panel_ids.add(panel_id)
            self.tab_panel_order.append(panel_id)
            if "is-active-panel" in classes:
                self.initial_active_panels.append(panel_id)
        if "data-tab-link" in attributes and (href := attributes.get("href")):
            self.tab_link_hrefs.add(href)
        if lane := attributes.get("data-protocol-lane"):
            self.protocol_lanes.add(lane)
        if example := attributes.get("data-protocol-example"):
            self.protocol_examples.add(example)
        if method := attributes.get("data-http-method"):
            self.http_methods.add(method)
        if method := attributes.get("data-supporting-method"):
            self.supporting_methods.add(method)
        if "data-method-comparison" in attributes:
            self.has_method_comparison = True
        if "data-method-table" in attributes:
            self.has_method_table = True
        if family := attributes.get("data-status-family"):
            self.status_families.add(family)
        if code := attributes.get("data-status-code"):
            self.essential_status_codes.add(code)
        if code := attributes.get("data-secondary-status"):
            self.secondary_status_codes.add(code)
        if comparison := attributes.get("data-status-comparison"):
            self.status_comparisons.add(comparison)
        if "data-status-flow" in attributes:
            self.has_status_flow = True
        if header_name := attributes.get("data-http-header"):
            self.header_names.add(header_name)
        if header_pair := attributes.get("data-header-pair"):
            self.header_pairs.add(header_pair)
        if cache_state := attributes.get("data-cache-state"):
            self.cache_states.add(cache_state)
        if cache_directive := attributes.get("data-cache-directive"):
            self.cache_directives.add(cache_directive)
        if "data-cache-flow" in attributes:
            self.has_cache_flow = True
        if "data-cache-layers" in attributes:
            self.has_cache_layers = True
        if cdn_node := attributes.get("data-cdn-node"):
            self.cdn_nodes.add(cdn_node)
        if cdn_result := attributes.get("data-cdn-result"):
            self.cdn_results.add(cdn_result)
        if cdn_concept := attributes.get("data-cdn-concept"):
            self.cdn_concepts.add(cdn_concept)
        if cdn_control := attributes.get("data-cdn-control"):
            self.cdn_controls.add(cdn_control)
        if cdn_example := attributes.get("data-cdn-example"):
            self.cdn_examples.add(cdn_example)
        if cdn_quick_card := attributes.get("data-cdn-quick-card"):
            self.cdn_quick_cards.add(cdn_quick_card)
        if cdn_layer := attributes.get("data-cdn-layer"):
            self.cdn_layers.append(cdn_layer)
        if cdn_cache_group := attributes.get("data-cdn-cache-group"):
            self.cdn_cache_groups.add(cdn_cache_group)
        if cdn_site_mode := attributes.get("data-cdn-site-mode"):
            self.cdn_site_modes.add(cdn_site_mode)
        if cdn_practical_use := attributes.get("data-cdn-use"):
            self.cdn_practical_uses.add(cdn_practical_use)
        if cdn_story_step := attributes.get("data-cdn-story-step"):
            self.cdn_story_steps.add(cdn_story_step)
        if cdn_story_country := attributes.get("data-cdn-country"):
            self.cdn_story_countries.add(cdn_story_country)
        if cdn_story_route := attributes.get("data-cdn-story-route"):
            self.cdn_story_routes.add(cdn_story_route)
        if "data-cdn-country-story" in attributes:
            self.has_cdn_country_story = True
        if "data-cdn-interview-answer" in attributes:
            self.has_cdn_interview_answer = True
        if "data-cdn-route" in attributes:
            self.has_cdn_route = True
        if "data-cdn-security" in attributes:
            self.has_cdn_security = True
        if "data-cdn-personalization-warning" in attributes:
            self.has_cdn_personalization_warning = True
        if cookie_layer := attributes.get("data-cookie-layer"):
            self.cookie_layers.append(cookie_layer)
        if cookie_key_idea := attributes.get("data-cookie-key-idea"):
            self.cookie_key_ideas.add(cookie_key_idea)
        if cookie_problem := attributes.get("data-cookie-problem"):
            self.cookie_problems.add(cookie_problem)
        if cookie_login_step := attributes.get("data-cookie-login-step"):
            self.cookie_login_steps.add(cookie_login_step)
        if cookie_attribute := attributes.get("data-cookie-attribute"):
            self.cookie_attributes.add(cookie_attribute)
        if cookie_detail_topic := attributes.get("data-cookie-detail-topic"):
            self.cookie_detail_topics.add(cookie_detail_topic)
        if cookie_example := attributes.get("data-cookie-example"):
            self.cookie_examples.add(cookie_example)
        if cookie_related_topic := attributes.get("data-cookie-related-topic"):
            self.cookie_related_topics.add(cookie_related_topic)
        if cors_layer := attributes.get("data-cors-layer"):
            self.cors_layers.append(cors_layer)
        if cors_key_idea := attributes.get("data-cors-key-idea"):
            self.cors_key_ideas.add(cors_key_idea)
        if cors_boundary := attributes.get("data-cors-boundary"):
            self.cors_boundaries.add(cors_boundary)
        if cors_solve := attributes.get("data-cors-solves"):
            self.cors_solves.add(cors_solve)
        if cors_non_solution := attributes.get("data-cors-does-not-solve"):
            self.cors_does_not_solve.add(cors_non_solution)
        if cors_environment := attributes.get("data-cors-environment"):
            self.cors_environments.add(cors_environment)
        if cors_flow := attributes.get("data-cors-flow"):
            self.cors_flows.add(cors_flow)
        if cors_preflight_step := attributes.get("data-cors-preflight-step"):
            self.cors_preflight_steps.add(cors_preflight_step)
        if cors_actor := attributes.get("data-cors-actor"):
            self.cors_actors.add(cors_actor)
        if cors_header := attributes.get("data-cors-header"):
            self.cors_headers.add(cors_header)
        if "data-cors-interview-answer" in attributes:
            self.has_cors_interview_answer = True
        if csrf_layer := attributes.get("data-csrf-layer"):
            self.csrf_layers.append(csrf_layer)
        if csrf_key_idea := attributes.get("data-csrf-key-idea"):
            self.csrf_key_ideas.add(csrf_key_idea)
        if csrf_flow_step := attributes.get("data-csrf-flow-step"):
            self.csrf_flow_steps.add(csrf_flow_step)
        if csrf_example := attributes.get("data-csrf-example"):
            self.csrf_examples.add(csrf_example)
        if csrf_token_step := attributes.get("data-csrf-token-step"):
            self.csrf_token_steps.add(csrf_token_step)
        if csrf_defense := attributes.get("data-csrf-defense"):
            self.csrf_defenses.add(csrf_defense)
        if csrf_limit := attributes.get("data-csrf-limit"):
            self.csrf_limits.add(csrf_limit)
        if csrf_relevance := attributes.get("data-csrf-relevance"):
            self.csrf_relevance.add(csrf_relevance)
        if security_topic := attributes.get("data-security-topic"):
            self.security_topics.add(security_topic)
        if "data-security-comparison" in attributes:
            self.has_security_comparison = True
        if "data-csrf-interview-answer" in attributes:
            self.has_csrf_interview_answer = True
        if http_version_layer := attributes.get("data-http-version-layer"):
            self.http_version_layers.append(http_version_layer)
            if self._http_version_details_depth is not None:
                self.http_version_layers_inside_details.append(http_version_layer)
        if simple_asset := attributes.get("data-http-version-simple-asset"):
            self.http_version_simple_assets.append(simple_asset)
        if simple_version := attributes.get("data-http-version-simple-example"):
            self.http_version_simple_examples.append(
                (
                    simple_version,
                    attributes.get("data-http-version-loss-scenario"),
                    attributes.get("data-http-version-loss-result"),
                )
            )
        if self_check := attributes.get("data-http-version-self-check"):
            self.http_version_self_checks.append(self_check)
        if check_answer := attributes.get("data-http-version-check-answer"):
            self.http_version_check_answers.append(check_answer)
        if http_version := attributes.get("data-http-version"):
            self.http_versions.add(http_version)
        if http_version_example := attributes.get("data-http-version-example"):
            self.http_version_example_versions.add(http_version_example)
        if http_version_asset := attributes.get("data-http-version-asset"):
            self.http_version_assets.add(http_version_asset)
        if http_version_step := attributes.get("data-http-version-step"):
            self.http_version_example_steps.add(http_version_step)
        if http_version_problem := attributes.get("data-http-version-problem"):
            self.http_version_problems.add(http_version_problem)
        if http_version_solution := attributes.get("data-http-version-solution"):
            self.http_version_solutions.add(http_version_solution)
        if http_version_comparison := attributes.get("data-http-version-comparison"):
            self.http_version_comparisons.add(http_version_comparison)
        if http_version_term := attributes.get("data-http-version-term"):
            self.http_version_terms.add(http_version_term)
        if quic_stack_layer := attributes.get("data-quic-stack"):
            self.quic_stack.add(quic_stack_layer)
        if quic_feature := attributes.get("data-quic-feature"):
            self.quic_features.add(quic_feature)
        if http_version_myth := attributes.get("data-http-version-myth"):
            self.http_version_myths.add(http_version_myth)
        if "data-http-version-comparison-table" in attributes:
            self.has_http_version_comparison = True
        if "data-http-versions-interview-answer" in attributes:
            self.has_http_versions_interview_answer = True
        if "data-http-version-child-summary" in attributes:
            self.has_http_version_child_summary = True
        if tag == "details" and "data-http-version-details" in attributes:
            self.http_version_details.append((tag, "open" in attributes))
            self._http_version_details_depth = len(self._open_tags) + 1
        if tag == "summary" and "data-http-version-details-control" in attributes and self._http_version_details_depth is not None:
            parent_tag = self._open_tags[-1] if self._open_tags else None
            self.http_version_details_controls.append((tag, parent_tag))
        if realtime_layer := attributes.get("data-realtime-layer"):
            self.realtime_layers.append(realtime_layer)
        if realtime_method := attributes.get("data-realtime-method"):
            self.realtime_methods.append(
                (
                    realtime_method,
                    attributes.get("data-realtime-base"),
                    attributes.get("data-realtime-direction"),
                    attributes.get("data-realtime-reconnect"),
                )
            )
        if tag == "figure" and "data-realtime-diagram" in attributes:
            self.realtime_diagram_count += 1
        if realtime_animation := attributes.get("data-realtime-animation"):
            self.realtime_animations.add(realtime_animation)
        if realtime_lane := attributes.get("data-realtime-lane"):
            self.realtime_lanes.append(realtime_lane)
        if realtime_message := attributes.get("data-realtime-message"):
            self.realtime_messages.append(
                (realtime_message, attributes.get("data-realtime-message-direction"))
            )
        if realtime_analogy := attributes.get("data-realtime-analogy"):
            self.realtime_analogies.add(realtime_analogy)
        if realtime_choice := attributes.get("data-realtime-choice"):
            self.realtime_choices.add(
                (realtime_choice, attributes.get("data-realtime-choice-result"))
            )
        if realtime_qualifier := attributes.get("data-realtime-qualifier"):
            self.realtime_qualifiers.add(realtime_qualifier)
        if realtime_detail_topic := attributes.get("data-realtime-detail-topic"):
            self.realtime_detail_topics.add(realtime_detail_topic)
        if realtime_concept := attributes.get("data-realtime-concept"):
            self.realtime_concepts.append(
                (
                    realtime_concept,
                    attributes.get("data-realtime-meaning"),
                    attributes.get("data-realtime-process"),
                    attributes.get("data-realtime-analogy-kind"),
                )
            )
        if "data-realtime-interview-answer" in attributes:
            self.has_realtime_interview_answer = True
        if dns_layer := attributes.get("data-dns-layer"):
            self.dns_layers.append(dns_layer)
        if dns_zone := attributes.get("data-dns-zone"):
            self.dns_zones.append(dns_zone)
        if dns_step := attributes.get("data-dns-sequence"):
            self.dns_sequence.append(dns_step)
        if dns_local_source := attributes.get("data-dns-local-source"):
            self.dns_local_sources.append(dns_local_source)
        if dns_network_server := attributes.get("data-dns-network-server"):
            self.dns_network_servers.append(dns_network_server)
        if dns_resolver_example := attributes.get("data-dns-resolver-example"):
            self.dns_resolver_examples.append(dns_resolver_example)
        if dns_branch := attributes.get("data-dns-branch"):
            self.dns_branches.add(dns_branch)
        if dns_handoff := attributes.get("data-dns-handoff"):
            self.dns_handoff.append(dns_handoff)
        if dns_answer_part := attributes.get("data-dns-answer-part"):
            self.dns_answer_parts.add(dns_answer_part)
        if dns_visible_node := attributes.get("data-dns-visible-node"):
            self.dns_visible_nodes.append(dns_visible_node)
        if dns_simple_call := attributes.get("data-dns-simple-call"):
            self.dns_simple_calls.append(dns_simple_call)
        if "data-dns-simple-route" in attributes:
            self.dns_simple_route_count += 1
        if dns_qualifier := attributes.get("data-dns-qualifier"):
            self.dns_qualifiers.add(dns_qualifier)
        if dns_record := attributes.get("data-dns-record"):
            if self._dns_details_depth is not None:
                self.dns_records_inside_details.append(dns_record)
        if tag == "figure" and "data-dns-diagram" in attributes:
            self.dns_diagram_count += 1
        if tag == "details" and "data-dns-details" in attributes:
            self.dns_details.append((tag, "open" in attributes))
            self._dns_details_depth = len(self._open_tags) + 1
        if tag == "summary" and "data-dns-details-control" in attributes and self._dns_details_depth is not None:
            parent_tag = self._open_tags[-1] if self._open_tags else None
            self.dns_details_controls.append((tag, parent_tag))
        if render_layer := attributes.get("data-render-layer"):
            self.render_layers.append(render_layer)
        if tag == "figure" and "data-render-diagram" in attributes:
            self.render_diagram_count += 1
        if render_request_step := attributes.get("data-render-request-step"):
            self.render_request_steps.append(render_request_step)
        if render_tree_step := attributes.get("data-render-tree-step"):
            self.render_tree_steps.append(render_tree_step)
        if render_stage := attributes.get("data-render-stage"):
            self.render_pipeline_steps.append(render_stage)
        if render_script := attributes.get("data-render-script"):
            self.render_script_rows.append(
                (
                    render_script,
                    attributes.get("data-render-parser"),
                    attributes.get("data-render-order"),
                    attributes.get("data-render-dcl"),
                )
            )
        if render_event := attributes.get("data-render-event"):
            self.render_event_rows.append(
                (
                    render_event,
                    attributes.get("data-render-event-after"),
                    attributes.get("data-render-event-does-not-wait"),
                )
            )
        if render_update := attributes.get("data-render-update"):
            self.render_update_rows.append(
                (render_update, attributes.get("data-render-update-path"))
            )
        if render_qualifier := attributes.get("data-render-qualifier"):
            self.render_qualifiers.add(render_qualifier)
        if render_detail_topic := attributes.get("data-render-detail-topic"):
            if self._render_details_depth is not None:
                self.render_detail_topics.append(render_detail_topic)
        if tag == "details" and "data-render-details" in attributes:
            self.render_details.append((tag, "open" in attributes))
            self._render_details_depth = len(self._open_tags) + 1
        if tag == "summary" and "data-render-details-control" in attributes and self._render_details_depth is not None:
            parent_tag = self._open_tags[-1] if self._open_tags else None
            self.render_details_controls.append((tag, parent_tag))
        if event_loop_layer := attributes.get("data-event-loop-layer"):
            self.event_loop_layers.append(event_loop_layer)
        if tag == "figure" and "data-event-loop-diagram" in attributes:
            self.event_loop_diagram_count += 1
        if event_loop_step := attributes.get("data-event-loop-step"):
            self.event_loop_cycle_steps.append(event_loop_step)
        if event_loop_example_step := attributes.get("data-event-loop-example-step"):
            self.event_loop_example_steps.append(event_loop_example_step)
        if event_loop_output := attributes.get("data-event-loop-output"):
            self.event_loop_example_output.append(event_loop_output)
        if event_loop_concept := attributes.get("data-event-loop-concept"):
            self.event_loop_concepts.add(event_loop_concept)
        if event_loop_solve := attributes.get("data-event-loop-solves"):
            self.event_loop_solves.add(event_loop_solve)
        if event_loop_limit := attributes.get("data-event-loop-limit"):
            self.event_loop_limits.add(event_loop_limit)
        if event_loop_qualifier := attributes.get("data-event-loop-qualifier"):
            self.event_loop_qualifiers.add(event_loop_qualifier)
        if event_loop_boundary := attributes.get("data-event-loop-async-boundary"):
            self.event_loop_async_boundaries.add(event_loop_boundary)
        if event_loop_detail_topic := attributes.get("data-event-loop-detail-topic"):
            if self._event_loop_details_depth is not None:
                self.event_loop_detail_topics.append(event_loop_detail_topic)
        if "data-event-loop-interview-answer" in attributes:
            self.has_event_loop_interview_answer = True
        if tag == "details" and "data-event-loop-details" in attributes:
            self.event_loop_details.append((tag, "open" in attributes))
            self._event_loop_details_depth = len(self._open_tags) + 1
        if tag == "summary" and "data-event-loop-details-control" in attributes and self._event_loop_details_depth is not None:
            parent_tag = self._open_tags[-1] if self._open_tags else None
            self.event_loop_details_controls.append((tag, parent_tag))
        if event_loop_foundation_layer := attributes.get("data-event-loop-foundation-layer"):
            self.event_loop_foundation_layers.append(event_loop_foundation_layer)
        if event_loop_runtime_layer := attributes.get("data-event-loop-runtime-layer"):
            self.event_loop_runtime_layers.append(event_loop_runtime_layer)
        if event_loop_start_step := attributes.get("data-event-loop-start-step"):
            self.event_loop_start_steps.append(event_loop_start_step)
        if event_loop_runtime_branch := attributes.get("data-event-loop-runtime-branch"):
            self.event_loop_runtime_branches.add(event_loop_runtime_branch)
        if browser_loop_layer := attributes.get("data-browser-loop-layer"):
            self.browser_loop_layers.append(browser_loop_layer)
        if browser_loop_step := attributes.get("data-browser-loop-step"):
            self.browser_loop_steps.append(browser_loop_step)
        if browser_task_source := attributes.get("data-browser-task-source"):
            self.browser_task_sources.add(browser_task_source)
        if browser_microtask := attributes.get("data-browser-microtask"):
            self.browser_microtasks.add(browser_microtask)
        if browser_render_step := attributes.get("data-browser-render-step"):
            self.browser_render_steps.append(browser_render_step)
        if browser_worker_part := attributes.get("data-browser-worker-part"):
            self.browser_worker_parts.add(browser_worker_part)
        if browser_loop_qualifier := attributes.get("data-browser-loop-qualifier"):
            self.browser_loop_qualifiers.add(browser_loop_qualifier)
        if "data-browser-loop-interview-answer" in attributes:
            self.has_browser_loop_interview_answer = True
        if tag == "details" and "data-browser-loop-details" in attributes:
            self.browser_loop_details.append((tag, "open" in attributes))
            self._browser_loop_details_depth = len(self._open_tags) + 1
        if tag == "summary" and "data-browser-loop-details-control" in attributes and self._browser_loop_details_depth is not None:
            parent_tag = self._open_tags[-1] if self._open_tags else None
            self.browser_loop_details_controls.append((tag, parent_tag))
        if browser_loop_detail_topic := attributes.get("data-browser-loop-detail-topic"):
            if self._browser_loop_details_depth is not None:
                self.browser_loop_detail_topics.append(browser_loop_detail_topic)
        if "data-loop-environment-intro" in attributes:
            self.loop_environment_order.append("environment-intro")
        if loop_environment := attributes.get("data-loop-environment"):
            self.loop_environments.append(loop_environment)
        if "data-loop-visual-comparison" in attributes:
            self.loop_environment_order.append("runtime-graphs")
            self._loop_visual_comparison_depth = len(self._open_tags) + 1
        if loop_visual_layout := attributes.get("data-loop-visual-layout"):
            self.loop_visual_layouts.append(loop_visual_layout)
        if loop_visual := attributes.get("data-loop-visual"):
            self.loop_visuals.append(loop_visual)
        if loop_diagram_svg := attributes.get("data-loop-diagram-svg"):
            self.loop_diagram_svgs.add(loop_diagram_svg)
        if self._loop_visual_comparison_depth is not None and tag == "animatemotion":
            self.loop_motion_tracks += 1
        if loop_visual_control := attributes.get("data-loop-control"):
            self.loop_visual_controls.add(loop_visual_control)
        if self._loop_visual_comparison_depth is not None and tag == "table":
            self.loop_comparison_tables += 1
        if browser_visual_step := attributes.get("data-browser-visual-step"):
            self.browser_visual_steps.append(browser_visual_step)
        if browser_visual_branch := attributes.get("data-browser-visual-branch"):
            self.browser_visual_branches.add(browser_visual_branch)
        if browser_visual_note := attributes.get("data-browser-visual-note"):
            self.browser_visual_notes.add(browser_visual_note)
        if node_visual_step := attributes.get("data-node-visual-step"):
            self.node_visual_steps.append(node_visual_step)
        if node_visual_phase := attributes.get("data-node-visual-phase"):
            self.node_visual_phases.append(node_visual_phase)
        if node_loop_layer := attributes.get("data-node-loop-layer"):
            self.node_loop_layers.append(node_loop_layer)
        if node_big_picture_step := attributes.get("data-node-big-picture-step"):
            self.node_big_picture_steps.append(node_big_picture_step)
        if node_key_point := attributes.get("data-node-key-point"):
            self.node_key_points.add(node_key_point)
        if node_start_step := attributes.get("data-node-start-step"):
            self.node_start_steps.append(node_start_step)
        if node_architecture_layer := attributes.get("data-node-architecture-layer"):
            self.node_architecture_layers.append(node_architecture_layer)
        if node_loop_phase := attributes.get("data-node-loop-phase"):
            self.node_loop_phases.append(node_loop_phase)
        if node_queue := attributes.get("data-node-queue"):
            self.node_queues.add(node_queue)
        if node_async_route := attributes.get("data-node-async-route"):
            self.node_async_routes.add(node_async_route)
        if node_example := attributes.get("data-node-example"):
            self.node_examples.add(node_example)
        if node_qualifier := attributes.get("data-node-qualifier"):
            self.node_qualifiers.add(node_qualifier)
        if "data-node-loop-interview-answer" in attributes:
            self.has_node_loop_interview_answer = True
        if tag == "details" and "data-node-loop-details" in attributes:
            self.node_loop_details.append((tag, "open" in attributes))
            self._node_loop_details_depth = len(self._open_tags) + 1
        if tag == "summary" and "data-node-loop-details-control" in attributes and self._node_loop_details_depth is not None:
            parent_tag = self._open_tags[-1] if self._open_tags else None
            self.node_loop_details_controls.append((tag, parent_tag))
        if node_loop_detail_topic := attributes.get("data-node-loop-detail-topic"):
            if self._node_loop_details_depth is not None:
                self.node_loop_detail_topics.append(node_loop_detail_topic)
        if promise_layer := attributes.get("data-promise-layer"):
            self.promise_layers.append(promise_layer)
        if promise_definition := attributes.get("data-promise-definition"):
            self.promise_definitions.add(promise_definition)
        if promise_state := attributes.get("data-promise-state"):
            self.promise_states.append(promise_state)
        if tag == "figure" and "data-promise-diagram" in attributes:
            self.promise_diagram_count += 1
        if promise_animation := attributes.get("data-promise-animation"):
            self.promise_animations.add(promise_animation)
        if promise_flow_step := attributes.get("data-promise-flow-step"):
            self.promise_flow_steps.append(promise_flow_step)
        if promise_flow_branch := attributes.get("data-promise-flow-branch"):
            self.promise_flow_branches.add(promise_flow_branch)
        if promise_handler := attributes.get("data-promise-handler"):
            self.promise_handlers.append(
                (promise_handler, attributes.get("data-promise-handler-role"))
            )
        if promise_async_await := attributes.get("data-promise-async-await"):
            self.promise_async_await_concepts.add(promise_async_await)
        if promise_execution := attributes.get("data-promise-execution"):
            self.promise_execution_modes.add(
                (promise_execution, attributes.get("data-promise-execution-behavior"))
            )
        if promise_combinator := attributes.get("data-promise-combinator"):
            self.promise_combinators.add(
                (promise_combinator, attributes.get("data-promise-combinator-result"))
            )
        if promise_pitfall := attributes.get("data-promise-pitfall"):
            self.promise_pitfalls.add(promise_pitfall)
        if "data-promise-interview-answer" in attributes:
            self.has_promise_interview_answer = True
        if variable_layer := attributes.get("data-variable-layer"):
            self.variable_layers.append(variable_layer)

        if closure_layer := attributes.get("data-closure-layer"):
            self.closure_layers.append(closure_layer)

        if react_layer := attributes.get("data-react-layer"):
            self.react_layers.append(react_layer)
        if react_say := attributes.get("data-react-say"):
            self.react_say.append(react_say)
        if react_definition := attributes.get("data-react-definition"):
            self.react_definitions.append(react_definition)
        if order_moment := attributes.get("data-order-moment"):
            self.order_moments.append(order_moment)
        if order_card := attributes.get("data-order-card"):
            self.order_cards.append(order_card)
        if order_band := attributes.get("data-order-band"):
            self.order_bands.append(order_band)
        if order_tag := attributes.get("data-order-tag"):
            self.order_tags.append(order_tag)
        if react_commit := attributes.get("data-react-commit"):
            self.react_commit.append(react_commit)
        if "data-react-script" in attributes:
            self.has_react_script = True
        if react_phase := attributes.get("data-react-phase"):
            self.react_phases.append(react_phase)
        if react_rule := attributes.get("data-react-rule"):
            self.react_rules.append(react_rule)
        if react_cause := attributes.get("data-react-cause"):
            self.react_causes.append(react_cause)
        if rerender_layer := attributes.get("data-rerender-layer"):
            self.rerender_layers.append(rerender_layer)
        if rerender_definition := attributes.get("data-rerender-definition"):
            self.rerender_definitions.append(rerender_definition)
        if rerender_say := attributes.get("data-rerender-say"):
            self.rerender_say.append(rerender_say)
        if rerender_trap := attributes.get("data-rerender-trap"):
            self.rerender_traps.append(rerender_trap)
        if story := attributes.get("data-story"):
            self.stories.append(story)
        if "data-rerender-script" in attributes:
            self.has_rerender_script = True
        if memo_layer := attributes.get("data-memo-layer"):
            self.memo_layers.append(memo_layer)
        if memo_definition := attributes.get("data-memo-definition"):
            self.memo_definitions.append(memo_definition)
        if memo_say := attributes.get("data-memo-say"):
            self.memo_say.append(memo_say)
        if memo_fact := attributes.get("data-memo-fact"):
            self.memo_facts.append(memo_fact)
        if "data-memo-script" in attributes:
            self.has_memo_script = True
        if hooktab_layer := attributes.get("data-hooktab-layer"):
            self.hooktab_layers.append(hooktab_layer)
        if hooktab_definition := attributes.get("data-hooktab-definition"):
            self.hooktab_definitions.append(hooktab_definition)
        if hooktab_say := attributes.get("data-hooktab-say"):
            self.hooktab_say.append(hooktab_say)
        if hooktab_guide := attributes.get("data-hooktab-guide"):
            self.hooktab_guide.append(hooktab_guide)
        if "data-hooktab-script" in attributes:
            self.has_hooktab_script = True
        if patterns_layer := attributes.get("data-patterns-layer"):
            self.patterns_layers.append(patterns_layer)
        if patterns_definition := attributes.get("data-patterns-definition"):
            self.patterns_definitions.append(patterns_definition)
        if patterns_say := attributes.get("data-patterns-say"):
            self.patterns_say.append(patterns_say)
        if patterns_guide := attributes.get("data-patterns-guide"):
            self.patterns_guide.append(patterns_guide)
        if "data-patterns-script" in attributes:
            self.has_patterns_script = True
        if statetab_layer := attributes.get("data-statetab-layer"):
            self.statetab_layers.append(statetab_layer)
        if statetab_definition := attributes.get("data-statetab-definition"):
            self.statetab_definitions.append(statetab_definition)
        if statetab_say := attributes.get("data-statetab-say"):
            self.statetab_say.append(statetab_say)
        if statetab_guide := attributes.get("data-statetab-guide"):
            self.statetab_guide.append(statetab_guide)
        if "data-statetab-script" in attributes:
            self.has_statetab_script = True
        if csp_layer := attributes.get("data-csp-layer"):
            self.csp_layers.append(csp_layer)
        if csp_directive := attributes.get("data-csp-directive"):
            self.csp_directives.append(csp_directive)
        if csp_compare := attributes.get("data-csp-compare"):
            self.csp_compare.append(csp_compare)
        if "data-csp-interview-answer" in attributes:
            self.has_csp_interview_answer = True
        if thistab_layer := attributes.get("data-thistab-layer"):
            self.thistab_layers.append(thistab_layer)
        if thistab_say := attributes.get("data-thistab-say"):
            self.thistab_say.append(thistab_say)
        if thistab_guide := attributes.get("data-thistab-guide"):
            self.thistab_guide.append(thistab_guide)
        if "data-thistab-script" in attributes:
            self.has_thistab_script = True
        if prototab_layer := attributes.get("data-prototab-layer"):
            self.prototab_layers.append(prototab_layer)
        if prototab_say := attributes.get("data-prototab-say"):
            self.prototab_say.append(prototab_say)
        if prototab_guide := attributes.get("data-prototab-guide"):
            self.prototab_guide.append(prototab_guide)
        if "data-prototab-script" in attributes:
            self.has_prototab_script = True
        if tstab_layer := attributes.get("data-tstab-layer"):
            self.tstab_layers.append(tstab_layer)
        if tstab_say := attributes.get("data-tstab-say"):
            self.tstab_say.append(tstab_say)
        if tstab_guide := attributes.get("data-tstab-guide"):
            self.tstab_guide.append(tstab_guide)
        if "data-tstab-script" in attributes:
            self.has_tstab_script = True
        if aitab_layer := attributes.get("data-aitab-layer"):
            self.aitab_layers.append(aitab_layer)
        if aitab_say := attributes.get("data-aitab-say"):
            self.aitab_say.append(aitab_say)
        if react_node := attributes.get("data-react-node"):
            self.react_nodes.append(react_node)
        if react_op := attributes.get("data-react-op"):
            self.react_ops.append(react_op)
        if key_list := attributes.get("data-key-demo-list"):
            self.key_demo_lists.append(key_list)

        if solves := attributes.get("data-solves"):
            self.closure_solves.append(solves)

        if gc_chain := attributes.get("data-gc-chain"):
            self.gc_chains.append(gc_chain)

        if gc_verdict := attributes.get("data-gc-verdict"):
            self.gc_verdicts.append(gc_verdict)

        if "data-gc-cut" in attributes:
            self.gc_cuts += 1

        if "data-closure-interview-answer" in attributes:
            self.has_closure_interview_answer = True
        if variable_card := attributes.get("data-variable-card"):
            self.variable_cards.append(
                (
                    variable_card,
                    attributes.get("data-variable-scope"),
                    attributes.get("data-variable-reassign"),
                    attributes.get("data-variable-redeclare"),
                    attributes.get("data-variable-before-declaration"),
                    attributes.get("data-variable-initializer"),
                )
            )
        if tag == "figure" and "data-variable-diagram" in attributes:
            self.variable_diagram_count += 1
        if variable_animation := attributes.get("data-variable-animation"):
            self.variable_animations.add(variable_animation)
        if variable_room := attributes.get("data-variable-room"):
            self.variable_rooms.append(variable_room)
        if variable_box := attributes.get("data-variable-box"):
            self.variable_boxes.add(
                (variable_box, attributes.get("data-variable-visible-after-block"))
            )
        if variable_decision := attributes.get("data-variable-decision"):
            self.variable_decisions.add(
                (variable_decision, attributes.get("data-variable-decision-result"))
            )
        if variable_error := attributes.get("data-variable-error"):
            self.variable_errors.add(
                (variable_error, attributes.get("data-variable-error-type"))
            )
        if variable_pitfall := attributes.get("data-variable-pitfall"):
            self.variable_pitfalls.add(variable_pitfall)
        if "data-variable-interview-answer" in attributes:
            self.has_variable_interview_answer = True
        if about_layer := attributes.get("data-about-layer"):
            self.about_layers.add(about_layer)
        if about_proof := attributes.get("data-about-proof"):
            self.about_proofs.add(about_proof)
        if about_chunk := attributes.get("data-about-chunk"):
            self.about_chunks.append(about_chunk)
        if about_case := attributes.get("data-about-case"):
            self.about_cases.append(about_case)
        if about_followup := attributes.get("data-about-followup"):
            self.about_followups.append(about_followup)
        if about_avoid := attributes.get("data-about-avoid"):
            self.about_avoid.add(about_avoid)
        if roadmap_topic := attributes.get("data-roadmap-topic"):
            self.roadmap_topics.add(roadmap_topic)
        if "data-cookie-analogy" in attributes:
            self.has_cookie_analogy = True
        if "data-cookie-interview-answer" in attributes:
            self.has_cookie_interview_answer = True
        if tag == "link" and "stylesheet" in attributes.get("rel", "").split():
            if href := attributes.get("href"):
                self.stylesheet_hrefs.add(href)
        if tag == "script" and (source := attributes.get("src")):
            self.script_sources.add(source.split("?", 1)[0])
        if self._inside_nav and tag == "a" and (href := attributes.get("href")):
            self.nav_hrefs.add(href)
        if attributes.get("id") == "overview":
            self._overview_depth = len(self._open_tags) + 1
        if attributes.get("id") == "http-vs-https":
            self._http_https_depth = len(self._open_tags) + 1
        if "quick-cards" in classes:
            self._quick_cards_depth = len(self._open_tags) + 1

        if tag not in self.VOID_TAGS:
            self._open_tags.append(tag)

    def handle_endtag(self, tag):
        if tag == "nav":
            self._inside_nav = False
        if self._open_tags and self._open_tags[-1] == tag:
            self._open_tags.pop()
        if self._quick_cards_depth is not None and len(self._open_tags) < self._quick_cards_depth:
            self._quick_cards_depth = None
        if self._overview_depth is not None and len(self._open_tags) < self._overview_depth:
            self._overview_depth = None
        if self._http_https_depth is not None and len(self._open_tags) < self._http_https_depth:
            self._http_https_depth = None
        if self._http_version_details_depth is not None and len(self._open_tags) < self._http_version_details_depth:
            self._http_version_details_depth = None
        if self._dns_details_depth is not None and len(self._open_tags) < self._dns_details_depth:
            self._dns_details_depth = None
        if self._render_details_depth is not None and len(self._open_tags) < self._render_details_depth:
            self._render_details_depth = None
        if self._event_loop_details_depth is not None and len(self._open_tags) < self._event_loop_details_depth:
            self._event_loop_details_depth = None
        if self._browser_loop_details_depth is not None and len(self._open_tags) < self._browser_loop_details_depth:
            self._browser_loop_details_depth = None
        if self._node_loop_details_depth is not None and len(self._open_tags) < self._node_loop_details_depth:
            self._node_loop_details_depth = None
        if self._loop_visual_comparison_depth is not None and len(self._open_tags) < self._loop_visual_comparison_depth:
            self._loop_visual_comparison_depth = None
        if self._tablist_depth is not None and len(self._open_tags) < self._tablist_depth:
            self._tablist_depth = None


class PageContractTest(unittest.TestCase):
    def test_page_entrypoint_exists(self):
        """Catches a missing or renamed browser entrypoint."""
        self.assertTrue(INDEX_FILE.is_file(), "index.html must exist in the project root")

    def test_page_exposes_the_study_navigation_contract(self):
        """Catches missing semantic regions, sections, or matching navigation targets."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        required_sections = {"about-me", "vacancy-map", "interview-questions", "overview", "request-response", "http-vs-https", "tls", "http-methods", "status-codes", "headers-cache", "cdn", "cookies-cors", "cors", "csrf", "csp", "http-versions", "realtime-updates", "dns-request", "browser-rendering", "event-loop-browser", "event-loop-node", "promise-async-await", "var-let-const", "closures", "this-keyword", "prototypes", "react-rendering", "react-rerender", "react-memo", "react-hooks", "react-patterns", "react-state", "fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"}
        self.assertEqual(parser.html_lang, "ru")
        self.assertTrue({"aside", "nav", "main"}.issubset(parser.tags))
        self.assertTrue(required_sections.issubset(parser.ids))
        self.assertTrue({f"#{section}" for section in required_sections}.issubset(parser.nav_hrefs))

    def test_about_me_is_the_default_first_tab_before_the_http_topics(self):
        """Catches the self-presentation being buried after the technical material."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.brand_href, "#about-me")
        self.assertEqual(parser.tab_order[0], "#about-me")
        self.assertEqual(parser.tab_panel_order[0], "about-me")
        self.assertEqual(parser.initial_active_tabs, ["#about-me"])
        self.assertEqual(parser.initial_active_panels, ["about-me"])

    def test_about_me_holds_only_spoken_material(self):
        """Catches the tab drifting back into a resume dump instead of lines said out loud."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.about_layers,
            {"full-answer", "short-answer", "cases",
                "genui", "followups", "avoid"},
        )
        self.assertEqual(
            parser.about_chunks,
            ["project", "scale", "stack", "team", "bridge"],
        )
        self.assertEqual(parser.about_proofs, set(), "the three-number strip was removed on request")
        self.assertNotIn("about-proof-strip", INDEX_FILE.read_text(encoding="utf-8"))
        self.assertEqual(parser.about_cases, ["generative-ui", "ts-migration"])

    def test_vacancy_map_tab_reads_the_job_description_as_charts(self):
        """Catches the vacancy tab losing a diagram, a scene, or the honest list of gaps."""
        page = INDEX_FILE.read_text(encoding="utf-8")
        styles = STYLES_FILE.read_text(encoding="utf-8")
        tab = page[page.index('id="vacancy-map"'):page.index('id="interview-questions"')]

        self.assertEqual(
            re.findall(r'data-vacancy-layer="([a-z]+)"', tab),
            ["loop", "mix", "fit", "plan"],
            "four scenes: the pilot loop, the split of the month, the fit chart, the first ninety days",
        )
        self.assertEqual(tab.count("data-vloop-row="), 8, "eight steps in the pilot loop diagram")
        self.assertEqual(tab.count("data-vloop-step="), 8, "each step has its line in the list")
        self.assertEqual(tab.count("data-vmix-step="), 4, "four slices of the working month")
        self.assertEqual(tab.count("data-vplan-step="), 5, "five bands in the ninety-day plan")
        self.assertEqual(tab.count('class="vac-row"'), 19, "every line of the job description gets a bar")
        self.assertEqual(tab.count('class="vac-gbar'), 5, "one bar per band of the plan")
        self.assertEqual(
            re.findall(r'data-vacancy-gap="([a-z]+)"', tab),
            ["ab", "rag", "docker"],
            "the three gaps stay named out loud instead of being smoothed over",
        )
        self.assertEqual(tab.count("data-vacancy-say="), 4, "each scene ends with a spoken line")
        for word in ("feature flag", "A/B", "PoC", "RAG", "Docker", "production-ready", "менторинг", "техдолг"):
            self.assertIn(word, tab)
        for level in ("vac-bar--0", "vac-bar--1", "vac-bar--2", "vac-bar--3"):
            self.assertIn(level, tab, "all four levels of the scale are used")
            self.assertIn(f".{level}", styles)
        self.assertIn("#vacancy-map.is-active-panel", styles, "the scenes animate once when the tab opens")

    def test_interview_questions_tab_follows_the_pitch(self):
        """Catches the questions tab drifting out of the self-presentation group or losing a topic."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        self.assertEqual(parser.tab_order[:3], ["#about-me", "#vacancy-map", "#interview-questions"])
        self.assertEqual(parser.tab_panel_order[:3], ["about-me", "vacancy-map", "interview-questions"])
        tab = page[page.index('id="interview-questions"'):page.index('id="overview"')]
        for group in ("pilots", "ai", "codebase", "process", "terms"):
            self.assertIn(f'data-question-group="{group}"', tab)
        self.assertEqual(tab.count("data-question="), 18, "sixteen questions from the job description plus two closers")
        self.assertEqual(tab.count('data-question="closer"'), 2)
        self.assertNotIn("корпоративная культура", tab, "no template questions")
        for word in ("пилот", "промпт", "feature flags", "RAG", "Storybook", "менторинг", "техдолг", "по ТК", "испытательный срок"):
            self.assertIn(word, tab)
        for gone in ("USDT", "KYC", "крипт", "обменник", "курс"):
            self.assertNotIn(gone, tab, "the crypto-employer framing is gone: the offer is a regular Russian labour contract")
        self.assertIn(".questions-list li::before", STYLES_FILE.read_text(encoding="utf-8"))

    def test_about_me_shows_the_generative_ui_pipeline(self):
        """Catches the Generative UI diagram losing a step, its retry loop, or its spoken line."""
        page = INDEX_FILE.read_text(encoding="utf-8")
        block = page[page.index('data-about-layer="genui"'):page.index('data-about-layer="followups"')]

        self.assertEqual(block.count("data-genui-row="), 8, "eight steps in the pipeline diagram")
        self.assertEqual(block.count("data-genui-step="), 8, "each step has its line in the list")
        for word in ("Пользователь", "Фронт", "Бэкенд и модель", "Реестр китов", "safeParse", "плейсхолдер", "ретрай", "стрим JSON"):
            self.assertIn(word, block)
        self.assertIn('data-about-say="genui"', block)
        self.assertIn(".about-genui__lead", STYLES_FILE.read_text(encoding="utf-8"))

    def test_about_me_prepares_follow_up_answers_and_traps(self):
        """Catches the tab losing the answers to the questions that always follow the pitch."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))
        page = INDEX_FILE.read_text(encoding="utf-8")

        self.assertEqual(
            parser.about_followups,
            ["leaving", "salary", "gigachat", "valid-json", "mobile"],
        )
        self.assertEqual(
            parser.about_avoid,
            {"tenure", "experiment", "flags", "stack-dump"},
        )
        self.assertIn("GigaChat MAX", page)
        self.assertNotIn("6+ лет", page)

    def test_linked_local_assets_are_available(self):
        """Catches a page that loads without its visual system or navigation behavior."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.stylesheet_hrefs, {"styles.css"})
        self.assertEqual(
            parser.script_sources,
            {"navigation.js", "search.js", "event-loop-visual.js", "declarations-visual.js", "key-demo.js", "walk-visual.js", "rerender-visual.js", "realtime-visual.js", "script.js"},
        )
        for asset in parser.stylesheet_hrefs | parser.script_sources:
            self.assertTrue((PROJECT_ROOT / asset).is_file(), f"Missing linked asset: {asset}")

    def test_desktop_sidebar_search_exposes_an_accessible_combobox_outside_the_tablist(self):
        """Catches search being mixed into tab navigation or losing keyboard semantics."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.search_container, ("div", "search"))
        self.assertEqual(parser.search_label, ("label", "sidebar-search-input"))
        self.assertEqual(
            parser.search_input,
            (
                "input",
                "search",
                "combobox",
                "off",
                "list",
                "sidebar-search-results",
                "false",
            ),
        )
        self.assertEqual(parser.search_clear, ("button", "button", True))
        self.assertEqual(parser.search_status, ("p", "status", "polite"))
        self.assertEqual(
            parser.search_results,
            ("ul", "sidebar-search-results", "listbox", True),
        )
        self.assertFalse(parser.search_inside_tablist)

    def test_quick_tls_cards_follow_the_short_answer(self):
        """Catches a first screen that makes readers search for the TLS explanation."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        named_blocks = [
            name
            for classes in parser.overview_blocks
            for name in ("short-answer", "quick-cards", "protocol-route")
            if name in classes
        ]
        self.assertEqual(named_blocks, ["short-answer", "quick-cards", "protocol-route"])
        self.assertEqual(parser.quick_card_count, 2)

    def test_overview_does_not_repeat_the_removed_terms_grid(self):
        """Catches the removed glossary returning to the compact overview."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertFalse(any("terms-section" in classes for classes in parser.overview_blocks))

    def test_protocol_expansions_appear_before_the_short_answer(self):
        """Catches acronym explanations being buried below the overview content."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        named_blocks = [
            name
            for classes in parser.overview_blocks
            for name in ("protocol-expansions", "short-answer")
            if name in classes
        ]
        self.assertEqual(named_blocks, ["protocol-expansions", "short-answer"])

    def test_sections_expose_the_desktop_tab_contract(self):
        """Catches navigation regressing from one-at-a-time panels to a long desktop page."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        panel_ids = {"about-me", "vacancy-map", "interview-questions", "overview", "request-response", "http-vs-https", "tls", "http-methods", "status-codes", "headers-cache", "cdn", "cookies-cors", "cors", "csrf", "csp", "http-versions", "realtime-updates", "dns-request", "browser-rendering", "event-loop-browser", "event-loop-node", "promise-async-await", "var-let-const", "closures", "this-keyword", "prototypes", "react-rendering", "react-rerender", "react-memo", "react-hooks", "react-patterns", "react-state", "fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"}
        self.assertTrue(parser.has_tablist)
        self.assertEqual(parser.tab_hrefs, {f"#{panel_id}" for panel_id in panel_ids})
        self.assertEqual(parser.tab_controls, panel_ids)
        self.assertEqual(parser.tab_panel_ids, panel_ids)
        self.assertIn("#tls", parser.tab_link_hrefs)

    def test_http_https_section_explains_the_difference_visually(self):
        """Catches the HTTP/HTTPS tab falling back to a text-only comparison."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.protocol_lanes, {"http", "https"})
        self.assertEqual(parser.protocol_examples, {"http", "https"})
        self.assertEqual(
            parser.http_https_blocks,
            ["protocol-visual", "protocol-examples", "protocol-comparison"],
        )

    def test_http_methods_tab_covers_crud_and_method_semantics(self):
        """Catches the methods tab losing CRUD cards or the practical comparisons."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.http_methods, {"GET", "POST", "PUT", "PATCH", "DELETE"})
        self.assertEqual(parser.supporting_methods, {"HEAD", "OPTIONS"})
        self.assertTrue(parser.has_method_comparison)
        self.assertTrue(parser.has_method_table)

    def test_status_codes_tab_explains_families_and_interview_comparisons(self):
        """Catches the status-code tab losing a family, key code, or practical comparison."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.status_families, {"1xx", "2xx", "3xx", "4xx", "5xx"})
        self.assertEqual(
            parser.essential_status_codes,
            {
                "200", "201", "204",
                "301", "302", "304", "307", "308",
                "400", "401", "403", "404", "409", "422",
                "500", "502", "503", "504",
            },
        )
        self.assertEqual(
            parser.secondary_status_codes,
            {"100", "101", "202", "206", "303", "405", "412", "415", "429", "501"},
        )
        self.assertEqual(parser.status_comparisons, {"success", "redirect", "client", "server"})
        self.assertTrue(parser.has_status_flow)

    def test_headers_cache_tab_connects_headers_to_cache_revalidation(self):
        """Catches the headers/cache tab losing core pairs or the cache lifecycle."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.header_pairs,
            {
                "content-type-accept",
                "set-cookie-cookie",
                "etag-if-none-match",
                "last-modified-if-modified-since",
            },
        )
        self.assertEqual(
            parser.header_names,
            {
                "Content-Type", "Accept", "Authorization", "Cookie", "Set-Cookie",
                "User-Agent", "Host", "Location", "Cache-Control", "ETag",
                "Last-Modified", "If-None-Match", "If-Modified-Since", "Vary",
            },
        )
        self.assertEqual(
            parser.cache_states,
            {"empty", "fresh", "stale", "not-modified", "modified"},
        )
        self.assertEqual(
            parser.cache_directives,
            {
                "max-age", "no-cache", "no-store", "public", "private",
                "immutable", "must-revalidate", "s-maxage",
            },
        )
        self.assertTrue(parser.has_cache_flow)
        self.assertTrue(parser.has_cache_layers)

    def test_cdn_tab_explains_delivery_cache_controls_and_safe_usage(self):
        """Catches the CDN tab losing its route, cache outcomes, or safety boundary."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.cdn_nodes, {"client", "edge", "origin"})
        self.assertEqual(parser.cdn_results, {"hit", "miss", "stale"})
        self.assertEqual(
            parser.cdn_concepts,
            {"pop", "edge", "origin", "ttl", "cache-key", "purge"},
        )
        self.assertEqual(
            parser.cdn_controls,
            {"cache-control", "s-maxage", "vary"},
        )
        self.assertEqual(parser.cdn_examples, {"static", "html", "api"})
        self.assertTrue(parser.has_cdn_route)
        self.assertTrue(parser.has_cdn_security)
        self.assertTrue(parser.has_cdn_personalization_warning)

    def test_cdn_country_story_shows_how_originals_become_regional_copies(self):
        """Catches the concrete Origin-to-Edge story becoming abstract or incomplete."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.cdn_quick_cards, {"definition", "cache-scope"})
        self.assertEqual(
            parser.cdn_story_steps,
            {"origin-created", "cdn-connected", "russia-miss", "russia-hit", "japan-cache"},
        )
        self.assertEqual(parser.cdn_story_countries, {"germany", "russia", "japan"})
        self.assertEqual(
            parser.cdn_story_routes,
            {"upload", "domain-through-cdn", "russia-origin", "russia-edge", "japan-edge"},
        )
        self.assertEqual(parser.cdn_practical_uses, {"products", "media", "site-files"})
        self.assertTrue(parser.has_cdn_country_story)

    def test_cdn_tab_puts_a_complete_interview_cheat_sheet_before_examples_and_details(self):
        """Catches essential CDN answers being buried below examples or technical details."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.cdn_layers,
            ["short-answer", "cheat-sheet", "example", "details"],
        )
        self.assertEqual(parser.cdn_quick_cards, {"definition", "cache-scope"})
        self.assertEqual(parser.cdn_cache_groups, {"usually-cache", "usually-origin"})
        self.assertEqual(parser.cdn_site_modes, {"static", "dynamic"})
        self.assertTrue(parser.has_cdn_interview_answer)

    def test_cookie_tab_puts_the_fast_interview_path_before_technical_details(self):
        """Catches the Cookie/CORS tab burying the quick answer below deep details."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.cookie_layers,
            [
                "short-answer",
                "key-ideas",
                "problems",
                "login-flow",
                "cross-origin-example",
                "attributes",
                "next-tabs",
                "interview-answer",
            ],
        )
        self.assertTrue(parser.has_cookie_interview_answer)
        self.assertEqual(parser.cookie_related_topics, {"cors", "csrf"})
        self.assertEqual(parser.cookie_detail_topics, set())
        self.assertEqual(parser.roadmap_topics, set())

    def test_cookie_tab_explains_login_cross_site_access_and_the_problems_they_solve(self):
        """Catches the tab losing a concrete example, protection boundary, or Cookie attribute."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.cookie_key_ideas, {"memory", "samesite", "browser-boundary"})
        self.assertEqual(
            parser.cookie_problems,
            {"forgotten-login", "cross-site-reading", "legitimate-api", "forged-request"},
        )
        self.assertEqual(
            parser.cookie_login_steps,
            {"login", "set-cookie", "stored", "cookie", "recognized"},
        )
        self.assertEqual(
            parser.cookie_attributes,
            {"HttpOnly", "Secure", "SameSite", "Domain", "Path", "Max-Age"},
        )
        self.assertEqual(
            parser.cookie_examples,
            {"login-ticket", "shop-api", "blocked-read", "allowed-cors"},
        )
        self.assertTrue(parser.has_cookie_analogy)

    def test_cors_tab_explains_browser_boundary_clients_and_access_control_headers(self):
        """Catches CORS being presented as an API firewall or losing the Swagger/curl distinction."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.cors_layers,
            [
                "short-answer",
                "mental-model",
                "boundaries",
                "client-environments",
                "preflight-flow",
                "access-control-headers",
                "interview-answer",
            ],
        )
        self.assertEqual(
            parser.cors_key_ideas,
            {"browser-enforces", "server-permits", "response-may-be-hidden"},
        )
        self.assertEqual(parser.cors_boundaries, {"solves", "does-not-solve"})
        self.assertEqual(
            parser.cors_solves,
            {"controlled-browser-sharing", "separate-ui-api"},
        )
        self.assertEqual(
            parser.cors_does_not_solve,
            {"non-browser", "authentication-authorization", "csrf", "server-security"},
        )
        self.assertEqual(
            parser.cors_environments,
            {"browser-fetch", "swagger-ui", "curl-backend"},
        )
        self.assertEqual(parser.cors_actors, {"ui", "browser", "server"})
        self.assertEqual(
            parser.cors_headers,
            {
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Methods",
                "Access-Control-Allow-Headers",
                "Access-Control-Allow-Credentials",
                "Access-Control-Expose-Headers",
                "Access-Control-Max-Age",
            },
        )
        self.assertTrue(parser.has_cors_interview_answer)

    def test_cors_tab_visualizes_simple_requests_and_the_preflight_decision(self):
        """Catches preflight being described as universal or as user authorization."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.cors_flows, {"simple", "preflight"})
        self.assertEqual(
            parser.cors_preflight_steps,
            {"detect", "options", "permission", "actual-request-or-stop"},
        )

    def test_csrf_tab_visualizes_attack_examples_and_defense_layers(self):
        """Catches CSRF losing the automatic-cookie attack or the server-side token check."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.csrf_layers,
            [
                "short-answer",
                "mental-model",
                "attack-flow",
                "examples",
                "token-flow",
                "defenses",
                "comparison",
                "interview-answer",
            ],
        )
        self.assertEqual(
            parser.csrf_key_ideas,
            {"automatic-credentials", "action-without-reading", "server-needs-proof"},
        )
        self.assertEqual(
            parser.csrf_flow_steps,
            {"logged-in", "trap", "cookie-attached", "action-executed"},
        )
        self.assertEqual(parser.csrf_examples, {"bank-transfer", "email-change"})
        self.assertEqual(
            parser.csrf_token_steps,
            {"issue", "deliver-to-ui", "submit", "verify", "accept-or-reject"},
        )
        self.assertEqual(
            parser.csrf_defenses,
            {"csrf-token", "samesite", "origin-check", "safe-methods", "reauth"},
        )
        self.assertEqual(parser.csrf_limits, {"xss", "stolen-session", "authorization"})
        self.assertEqual(parser.csrf_relevance, {"cookie-auth", "manual-bearer"})
        self.assertTrue(parser.has_security_comparison)
        self.assertEqual(
            parser.security_topics,
            {"cors", "csrf", "authentication-authorization"},
        )
        self.assertTrue(parser.has_csrf_interview_answer)

    def test_http_versions_tab_puts_the_fast_answer_before_examples_and_details(self):
        """Catches the interview answer being buried or a protocol version disappearing."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.http_version_layers,
            [
                "child-summary",
                "technical-details",
                "short-answer",
                "evolution",
                "site-example",
                "problem-solution",
                "comparison",
                "quic-deep-dive",
                "glossary",
                "misconceptions",
                "interview-answer",
            ],
        )
        self.assertEqual(parser.http_versions, {"http1-1", "http2", "http3"})
        self.assertTrue(parser.has_http_versions_interview_answer)

    def test_http_versions_tab_starts_with_one_three_part_loss_story(self):
        """Catches the child explanation gaining extra parts, scenarios, or questions."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertTrue(parser.has_http_version_child_summary)
        self.assertEqual(parser.http_version_simple_assets, ["page", "style", "image"])
        self.assertEqual(
            parser.http_version_simple_examples,
            [
                ("http1-1", "image-piece-lost", "affected-connection"),
                ("http2", "image-piece-lost", "all-streams"),
                ("http3", "image-piece-lost", "image-stream-only"),
            ],
        )
        self.assertEqual(parser.http_version_self_checks, ["lost-image-piece"])
        self.assertEqual(parser.http_version_check_answers, ["http1-1", "http2", "http3"])
        page = INDEX_FILE.read_text(encoding="utf-8")
        summary = page[page.index('data-http-version-child-summary'):page.index('data-http-version-layer="technical-details"')]
        self.assertEqual(summary.count('data-story="http-versions"'), 1, "the child summary is one animated connections scene")
        self.assertEqual(summary.count("data-story-svg"), 1)
        for word in ("3 соединения", "всё вперемешку", "3 потока", "бинарные кадры", "TLS 1.3 в QUIC", "GET / HTTP/1.1", "ждут все три файла", "ждёт только картинка", "Как сказать"):
            self.assertIn(word, summary)
        self.assertNotIn("version-minute-card", summary, "the three heavy cards are gone")
        self.assertNotIn(">—</text>", summary, "the outcome column is filled from the start, not a dash placeholder")

    def test_http_versions_tab_keeps_existing_technical_layers_in_one_closed_details_control(self):
        """Catches jargon returning to the default view or detail layers escaping the disclosure."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.http_version_details, [("details", False)])
        self.assertEqual(parser.http_version_details_controls, [("summary", "details")])
        self.assertEqual(
            parser.http_version_layers_inside_details,
            [
                "short-answer",
                "evolution",
                "site-example",
                "problem-solution",
                "comparison",
                "quic-deep-dive",
                "glossary",
                "misconceptions",
                "interview-answer",
            ],
        )

    def test_http_versions_tab_replays_one_site_load_and_maps_problems_to_solutions(self):
        """Catches the comparison becoming abstract instead of showing the same workload."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.http_version_example_versions, {"http1-1", "http2", "http3"})
        self.assertEqual(
            parser.http_version_assets,
            {"html", "css", "javascript", "image-a", "image-b"},
        )
        self.assertEqual(
            parser.http_version_example_steps,
            {"html", "discover-assets", "request-assets", "packet-loss", "render"},
        )
        self.assertEqual(
            parser.http_version_problems,
            {"connection-reconnect", "request-queueing", "repeated-headers", "tcp-head-of-line", "network-change"},
        )
        self.assertEqual(
            parser.http_version_solutions,
            {"keep-alive", "multiplexing", "header-compression", "stream-isolation", "connection-migration"},
        )
        self.assertEqual(
            parser.http_version_comparisons,
            {"http-semantics", "transport", "wire-format", "parallelism", "header-compression", "packet-loss", "encryption", "network-change"},
        )
        self.assertTrue(parser.has_http_version_comparison)

    def test_http_versions_tab_explains_quic_over_udp_and_every_requested_term(self):
        """Catches QUIC being reduced to 'fast UDP' or a core interview term being omitted."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.quic_stack, {"http3", "quic", "udp", "ip"})
        self.assertEqual(
            parser.quic_features,
            {"reliability", "loss-recovery", "tls13", "independent-streams", "congestion-control", "connection-migration"},
        )
        self.assertEqual(
            parser.http_version_terms,
            {"tcp", "udp", "quic", "multiplexing", "binary-framing", "hpack-qpack", "head-of-line-blocking"},
        )
        self.assertEqual(
            parser.http_version_myths,
            {"http1-one-file-global", "http2-no-blocking", "http3-unreliable", "http3-always-faster"},
        )

    def test_realtime_updates_tab_follows_http_versions_and_precedes_dns(self):
        """Catches the missing communication-pattern tab or its placement outside the HTTP sequence."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        http_index = parser.tab_order.index("#http-versions")
        self.assertEqual(
            parser.tab_order[http_index:http_index + 3],
            ["#http-versions", "#realtime-updates", "#dns-request"],
        )
        panel_index = parser.tab_panel_order.index("http-versions")
        self.assertEqual(
            parser.tab_panel_order[panel_index:panel_index + 3],
            ["http-versions", "realtime-updates", "dns-request"],
        )
        self.assertEqual(
            parser.realtime_layers,
            ["short-answer", "handshake", "analogy", "diagram", "decision", "details", "interview-answer"],
        )

    def test_realtime_updates_compares_all_four_patterns_without_hiding_their_direction(self):
        """Catches Polling, Long Polling, SSE, or WebSocket being merged or explained with a wrong channel model."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.realtime_methods,
            [
                ("polling", "repeated-http-requests", "request-response", "app-controls"),
                ("long-polling", "held-http-request", "response-then-new-request", "app-controls"),
                ("sse", "streaming-http-response", "server-to-client", "eventsource-auto"),
                ("websocket", "websocket-frames-after-handshake", "bidirectional", "app-controls"),
            ],
        )
        self.assertEqual(parser.realtime_diagram_count, 1)
        self.assertEqual(parser.realtime_animations, {"message-directions"})
        self.assertEqual(parser.realtime_lanes, ["polling", "long-polling", "sse", "websocket"])
        self.assertEqual(parser.realtime_analogies, {"polling", "long-polling", "sse", "websocket"})

    def test_websocket_handshake_is_explained_before_the_detailed_material(self):
        """Catches handshake being left as unexplained jargon or buried in technical details."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.realtime_layers,
            ["short-answer", "handshake", "analogy", "diagram", "decision", "details", "interview-answer"],
        )
        self.assertEqual(
            parser.realtime_concepts,
            [("handshake", "initial-agreement", "http-upgrade-101-open-channel", "phone-hello")],
        )

    def test_realtime_diagram_preserves_each_message_sequence_and_direction(self):
        """Catches an animated request or response moving toward the wrong actor."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.realtime_messages,
            [
                ("poll-request-1", "client-to-server"),
                ("poll-response-1", "server-to-client"),
                ("poll-request-2", "client-to-server"),
                ("poll-response-2", "server-to-client"),
                ("poll-request-3", "client-to-server"),
                ("poll-response-3", "server-to-client"),
                ("long-request", "client-to-server"),
                ("long-wait", "server-waits"),
                ("long-response", "server-to-client"),
                ("sse-open", "client-to-server"),
                ("sse-event-1", "server-to-client"),
                ("sse-event-2", "server-to-client"),
                ("sse-event-3", "server-to-client"),
                ("websocket-open", "client-to-server"),
                ("websocket-client-message", "client-to-server"),
                ("websocket-server-message", "server-to-client"),
            ],
        )

    def test_realtime_updates_keeps_fast_choice_first_and_technical_caveats_available(self):
        """Catches the quick interview path losing its decisions or important transport caveats."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.realtime_choices,
            {
                ("rare-not-urgent", "polling"),
                ("compatible-http", "long-polling"),
                ("server-feed", "sse"),
                ("two-way", "websocket"),
            },
        )
        self.assertEqual(
            parser.realtime_qualifiers,
            {
                "client-opens-every-channel",
                "server-push-uses-client-opened-channel",
                "http-request-not-always-new-transport",
                "sse-separate-http-upstream",
                "websocket-no-auto-reconnect",
            },
        )
        self.assertEqual(
            parser.realtime_detail_topics,
            {"reconnect", "sse-limits", "websocket-handshake", "infrastructure"},
        )
        self.assertTrue(parser.has_realtime_interview_answer)

    def test_dns_tab_checks_the_computer_before_any_network_lookup(self):
        """Catches the locally available answer being skipped or shown after an external query."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.dns_layers, ["short-answer", "diagram", "details"])
        self.assertEqual(parser.dns_diagram_count, 1)
        self.assertEqual(parser.dns_zones, ["local", "network", "connection"])
        self.assertEqual(set(parser.dns_local_sources), {"browser-cache", "os-cache", "hosts"})
        self.assertEqual(
            parser.dns_sequence,
            [
                "browser-input",
                "local-resolution",
                "stub-resolver",
                "network-query",
                "recursive-resolver",
                "resolver-cache",
                "root",
                "tld",
                "authoritative",
                "answer-return",
                "address-selection",
                "connect",
                "tls",
                "http",
            ],
        )
        self.assertEqual(
            parser.dns_branches,
            {"local-hit", "local-miss", "resolver-cache-hit", "resolver-cache-miss"},
        )
        self.assertIn("local-order-varies", parser.dns_qualifiers)

    def test_dns_tab_explains_resolver_hierarchy_cache_and_http_handoff(self):
        """Catches DNS being shown as the page transport or referrals as final site addresses."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.dns_network_servers,
            ["recursive-resolver", "root", "tld", "authoritative"],
        )
        self.assertEqual(set(parser.dns_resolver_examples), {"router", "isp", "public"})
        self.assertEqual(parser.dns_answer_parts, {"ip-address", "ttl-cache"})
        self.assertEqual(
            parser.dns_qualifiers,
            {
                "local-order-varies",
                "cache-can-shortcut",
                "root-tld-return-referrals",
                "resolver-may-forward",
                "simplified-path",
            },
        )
        self.assertEqual(parser.dns_handoff, ["address-selection", "transport", "tls", "http"])
        self.assertEqual(parser.dns_details, [("details", False)])
        self.assertEqual(parser.dns_details_controls, [("summary", "details")])
        self.assertEqual(parser.dns_records_inside_details, ["a", "aaaa", "cname", "ttl"])

    def test_dns_diagram_stays_as_one_child_friendly_example(self):
        """Catches the first DNS explanation turning back into a dense infrastructure map."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.dns_simple_route_count, 1)
        self.assertEqual(
            parser.dns_visible_nodes,
            ["computer", "recursive-resolver", "root", "tld", "authoritative"],
        )
        self.assertEqual(
            parser.dns_simple_calls,
            ["ask-root", "ask-tld", "ask-authoritative"],
        )

    def test_browser_rendering_leads_into_two_separate_event_loop_tabs(self):
        """Catches the removed foundation tab returning or the two runtime tabs being merged."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.tab_order[-27:],
            ["#dns-request", "#browser-rendering", "#event-loop-browser", "#event-loop-node", "#promise-async-await", "#var-let-const", "#closures", "#this-keyword", "#prototypes", "#react-rendering", "#react-rerender", "#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"],
        )
        self.assertEqual(
            parser.tab_panel_order[-27:],
            ["dns-request", "browser-rendering", "event-loop-browser", "event-loop-node", "promise-async-await", "var-let-const", "closures", "this-keyword", "prototypes", "react-rendering", "react-rerender", "react-memo", "react-hooks", "react-patterns", "react-state", "fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"],
        )
        self.assertIn(("p", "javascript", True), parser.nav_groups)

    def test_browser_rendering_tab_uses_one_simple_end_to_end_diagram(self):
        """Catches the core explanation splitting into several diagrams or losing a rendering stage."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.render_layers,
            ["short-answer", "diagram", "script-matrix", "events", "details"],
        )
        self.assertEqual(parser.render_diagram_count, 1)
        self.assertEqual(
            parser.render_request_steps,
            [
                "url-input",
                "local-answer",
                "dns",
                "transport",
                "tls",
                "http",
                "server-cdn",
                "html-response",
            ],
        )
        self.assertEqual(
            parser.render_tree_steps,
            ["html", "dom", "css", "cssom", "dom-cssom-merge"],
        )
        self.assertEqual(
            parser.render_pipeline_steps,
            ["style", "layout", "paint", "composite", "screen"],
        )

    def test_browser_rendering_tab_pins_script_and_page_event_timing(self):
        """Catches async/defer or DOMContentLoaded/load being presented as interchangeable."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.render_script_rows,
            [
                ("classic", "stops-parser", "document-order", "dcl-waits"),
                ("defer", "continues-parser", "document-order", "dcl-waits"),
                ("async", "continues-until-execution", "no-order", "dcl-does-not-wait"),
                ("module", "continues-parser", "defer-like", "dcl-waits"),
            ],
        )
        self.assertEqual(
            parser.render_event_rows,
            [
                ("domcontentloaded", "dom-defer-module", "images-async"),
                ("load", "dependent-resources", "lazy-resources"),
            ],
        )
        self.assertIn("render-can-happen-before-events", parser.render_qualifiers)

    def test_browser_rendering_details_show_conditional_update_paths(self):
        """Catches every visual change being reduced to the false Layout-Paint-Composite sequence."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.render_details, [("details", False)])
        self.assertEqual(parser.render_details_controls, [("summary", "details")])
        self.assertEqual(
            parser.render_update_rows,
            [
                ("size-or-position", "style-layout-paint-composite"),
                ("color-or-shadow", "style-paint-composite"),
                ("transform-or-opacity", "composite-when-eligible"),
            ],
        )
        self.assertEqual(
            parser.render_detail_topics,
            ["render-tree-model", "display-none", "pseudo-elements", "rasterization"],
        )
        self.assertIn("optimization-not-guaranteed", parser.render_qualifiers)

    def test_event_loop_foundation_tab_and_panel_are_removed(self):
        """Catches the unwanted Event Loop foundation entry returning to the page."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertNotIn("#event-loop", parser.tab_hrefs)
        self.assertNotIn("event-loop", parser.tab_panel_ids)
        self.assertNotIn("event-loop", parser.ids)
        self.assertEqual(parser.event_loop_foundation_layers, [])

    def test_browser_event_loop_shows_tasks_microtasks_rendering_and_worker_as_distinct_paths(self):
        """Catches the browser cycle becoming a single queue or promising a paint after every task."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.browser_loop_layers,
            ["short-answer", "timeline", "queues", "worked-example", "worker", "interview-answer", "details"],
        )
        self.assertEqual(
            parser.browser_loop_steps,
            ["initial-task", "sync-to-completion", "microtask-checkpoint", "choose-next-work", "rendering-task", "repeat"],
        )
        self.assertEqual(
            parser.browser_task_sources,
            {"parsing-script", "timer", "user-interaction", "networking", "message"},
        )
        self.assertEqual(
            parser.browser_microtasks,
            {"promise", "await", "queue-microtask", "mutation-observer"},
        )
        self.assertEqual(parser.browser_render_steps, ["animation", "raf", "style-layout", "paint-composite"])
        self.assertEqual(parser.browser_worker_parts, {"main-loop", "messages", "worker-loop"})
        self.assertEqual(parser.event_loop_example_output, ["1", "2", "3", "4"])
        self.assertEqual(
            parser.browser_loop_qualifiers,
            {"task-not-macrotask", "multiple-task-queues", "rendering-not-guaranteed", "microtasks-drain-fully"},
        )
        self.assertTrue(parser.has_browser_loop_interview_answer)

    def test_browser_tab_contains_only_the_browser_animated_visual(self):
        """Catches the Node.js graph leaking back into the browser-only explanation."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.loop_visuals, ["browser"])
        self.assertEqual(parser.loop_diagram_svgs, {"browser"})
        self.assertEqual(parser.loop_motion_tracks, 1)
        self.assertEqual(parser.loop_visual_controls, {"pause", "replay"})
        self.assertEqual(parser.loop_comparison_tables, 0)
        self.assertEqual(
            parser.browser_visual_steps,
            [
                "choose-task",
                "call-stack",
                "microtask-checkpoint",
                "rendering-decision",
                "raf",
                "style",
                "layout",
                "observers",
                "paint",
                "raster",
                "composite",
                "screen-update",
                "post-render-microtasks",
                "next-task",
            ],
        )
        self.assertEqual(
            parser.browser_visual_branches,
            {"rendering-opportunity", "skip-render", "idle-if-empty"},
        )
        self.assertEqual(parser.browser_visual_notes, {"dom-before-pixels", "task-is-not-macrotask"})
        self.assertEqual(parser.node_visual_steps, [])
        self.assertEqual(parser.node_visual_phases, [])
        self.assertIn("event-loop-visual.js", parser.script_sources)

    def test_browser_event_loop_introduces_only_the_browser_environment_before_its_graph(self):
        """Catches Node.js material returning to the browser introduction."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.loop_environment_order, ["environment-intro", "runtime-graphs"])
        self.assertEqual(parser.loop_environments, ["javascript", "browser"])
        self.assertEqual(parser.loop_visual_layouts, ["single"])

        styles = STYLES_FILE.read_text(encoding="utf-8")
        grid_rule = styles.split(".loop-visual-comparison__grid {", 1)[1].split("}", 1)[0]
        self.assertIn("grid-template-columns: minmax(0, 1fr);", grid_rule)
        self.assertNotIn("repeat(2", grid_rule)

    def test_node_event_loop_is_a_short_big_picture_interview_cheat_sheet(self):
        """Catches the Node.js overview growing back into a phase-by-phase reference manual."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.node_loop_layers,
            ["short-answer", "big-picture", "key-points", "interview-answer"],
        )
        self.assertEqual(
            parser.node_big_picture_steps,
            ["run-javascript", "node-libuv", "outside-work", "ready-queue", "run-callback"],
        )
        self.assertEqual(
            parser.node_key_points,
            {"one-callback", "coordinates-work", "io-outside-stack", "sync-blocks"},
        )
        self.assertEqual(parser.node_loop_phases, [])
        self.assertEqual(parser.node_queues, set())
        self.assertEqual(parser.node_examples, set())
        self.assertEqual(parser.node_loop_details, [])
        self.assertTrue(parser.has_node_loop_interview_answer)

    def test_closures_tab_follows_declarations_and_precedes_roadmap(self):
        """Catches the closures topic drifting out of the JavaScript learning sequence."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.tab_order[-21:],
            ["#closures", "#this-keyword", "#prototypes", "#react-rendering", "#react-rerender", "#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"],
        )
        self.assertEqual(
            parser.tab_panel_order[-21:],
            ["closures", "this-keyword", "prototypes", "react-rendering", "react-rerender", "react-memo", "react-hooks", "react-patterns", "react-state", "fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"],
        )

    def test_react_tab_is_five_scenes_each_with_a_definition_and_a_spoken_line(self):
        """Catches the React tab drifting back into prose, or a scene losing its diagram, definition, or line."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))
        page = INDEX_FILE.read_text(encoding="utf-8")

        scenes = ["cycle", "order", "virtual-dom", "fiber", "hooks-map", "hooks", "update", "reconciliation", "keys-map", "keys"]
        self.assertIn(("p", "react", True), parser.nav_groups)
        self.assertEqual(parser.react_layers, scenes + ["causes", "script"])
        self.assertEqual(parser.react_definitions, scenes)
        self.assertEqual(parser.react_say, scenes)
        self.assertEqual(parser.react_phases, ["trigger", "render", "diff", "commit", "paint"])
        self.assertEqual(parser.react_commit, ["before-mutation", "mutation", "layout"])
        self.assertEqual(parser.react_nodes, ["root", "title", "list", "item-1", "item-2", "item-3"])
        self.assertEqual(parser.react_ops, ["patch", "insert"])
        self.assertEqual(parser.react_causes, ["state", "parent", "context", "external"])
        self.assertTrue(parser.has_react_script)
        self.assertEqual(
            parser.order_moments,
            ["root", "render", "begin-root", "begin-app", "walk", "complete", "commit"],
        )
        self.assertEqual(
            parser.order_cards,
            ["root", "render", "begin-root", "begin-app", "walk", "complete", "commit"],
            "one explanatory card per timeline moment",
        )
        self.assertEqual(parser.order_cards, parser.order_moments)
        self.assertEqual(parser.order_bands, ["prepare", "render", "commit"])
        self.assertEqual(parser.order_tags, ["reconcile", "reconcile", "reconcile"])
        self.assertEqual(page.count('class="order-scene__why"'), 0, "one line per moment, no separate why-lines")
        self.assertEqual(parser.react_layers[0], "cycle", "the ten-step cycle opens the React tab, above the timeline")
        cycle = page[page.index('data-react-layer="cycle"'):page.index('data-react-layer="order"')]
        self.assertEqual(cycle.count("data-cycle-row="), 10, "ten steps in the cycle diagram")
        self.assertEqual(cycle.count("data-cycle-step="), 10, "each step has its line in the list")
        for word in ("Твой код", "react — API", "Движок React", "Память · fiber", "Документ", "reconcileChildren", "commitMutationEffects"):
            self.assertIn(word, cycle)
        self.assertIn("key={t.id}", cycle, "the key travels from your code into the comparison step")
        self.assertIn("по type и key", cycle)
        hookmap = page[page.index('data-react-layer="hooks-map"'):page.index('data-react-layer="hooks"')]
        keymap = page[page.index('data-react-layer="keys-map"'):page.index('data-react-layer="keys"')]
        for word in ("key={index}", "key={id}", "Молоко", "было", "стало"):
            self.assertIn(word, keymap)
        self.assertEqual(keymap.count("cy-link--new"), 2, "the new card is drawn with a dashed link")
        for word in ("useState(0)", "useEffect(fn)", "слот 1", "слот 2", "карточка App"):
            self.assertIn(word, hookmap)
        styles = STYLES_FILE.read_text(encoding="utf-8")
        for selector in (".cy-pill--1 rect", ".cy-thread", ".cycle-steps li", "@keyframes cy-draw"):
            self.assertIn(selector, styles)
        self.assertNotIn(".wk-box--change", styles, "the replaced lanes map took its one-off class with it")
        self.assertIn("data-fiber-hooks", page)
        self.assertIn("memoizedState", page)
        self.assertIn("+ хуки App", page)
        self.assertIn("откуда берутся хуки", page)
        walk_scene = page[page.index("data-walk-visual"):page.index('data-react-layer="update"')]
        walk_svg = walk_scene[walk_scene.index("<svg"):walk_scene.index("</svg>")]
        self.assertIn("data-walk-svg", walk_svg)
        for column in ("Твой код", "Движок React", "Память · fiber", "Браузер"):
            self.assertIn(column, walk_svg, "the walkthrough keeps all four participants on one stage")
        for field in ("tok", "hl", "e-now", "e-mode", "e-do", "q", "tree", "s1", "s2", "af", "ak", "c-old", "c-new", "c-res", "bp", "bf", "bd", "dbtn", "stxt"):
            self.assertIn(f'data-wk="{field}"', walk_svg, f"walk-visual.js repaints the {field} field")
        for box in ("code-r", "react-r", "desc-r", "eng-r", "q-r", "cmp-r", "root-r", "app-r", "btn-r", "dom-r", "scr-r"):
            self.assertIn(f'data-wk="{box}"', walk_svg)
        for control in ("play", "prev", "next", "replay"):
            self.assertIn(f'data-walk-control="{control}"', walk_scene)
        self.assertEqual(walk_scene.count("data-walk-phase="), 5, "five phases: start, render, commit, effects, click")
        self.assertEqual(walk_scene.count("data-walk-cap"), 1)
        self.assertEqual(walk_scene.count("data-walk-term"), 1)
        self.assertIn("Реконсиляция", walk_svg)
        self.assertNotIn("<animate ", walk_svg, "the walkthrough is script-driven, not SMIL")
        self.assertNotIn("data-loop-", walk_scene, "the walkthrough must not borrow the Event Loop markup contract")
        self.assertNotIn("data-hooks-", page, "the old SMIL hooks scene is gone")
        self.assertIn("walk-visual.js", parser.script_sources)
        for selector in (".walk-scene__phase[aria-pressed=\"true\"]", ".wk-box--mem rect", ".wk-t--hook", ".walk-scene .is-wip", ".walk-scene .is-on"):
            self.assertIn(selector, STYLES_FILE.read_text(encoding="utf-8"))
        styles = STYLES_FILE.read_text(encoding="utf-8")
        for selector in (".order-card", ".oc-box--hook", "@keyframes order-card-4"):
            self.assertIn(selector, styles)
        self.assertEqual(styles.count("order-card-4 30s"), 1, "the timeline must stay slow enough to read a card")
        self.assertNotIn("order-card-4 12s", styles)
        self.assertIn(".order-scene:hover .order-card", styles, "hovering the timeline pauses it")
        for label in ("child", "sibling", "return", "alternate", "workInProgress", "root.current", "beginWork", "completeWork"):
            self.assertIn(label, page)
        react_tab = page[page.index('id="react-rendering"'):page.index('id="roadmap"')]
        self.assertNotIn("<pre", react_tab, "the React tab must stay free of code blocks")

    def test_rerender_tab_is_five_stories_seven_traps_and_a_script(self):
        """Catches the rerender tab losing a story, its controls, a trap, or drifting into prose."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)
        styles = STYLES_FILE.read_text(encoding="utf-8")

        self.assertEqual(parser.tab_order[-18:], ["#react-rendering", "#react-rerender", "#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"])
        stories = ["cost", "memo", "structure", "context", "transition"]
        self.assertEqual(parser.rerender_layers, stories + ["traps", "script"])
        self.assertEqual(parser.rerender_definitions, stories)
        self.assertEqual(parser.rerender_say, stories)
        react_stories = parser.stories[parser.stories.index("cost"):]
        self.assertEqual(react_stories[:5], stories)
        self.assertEqual(
            parser.rerender_traps,
            ["index-key", "inner-component", "inline-object", "effect-loop", "provider-value", "memo-everywhere", "derived-state"],
        )
        self.assertTrue(parser.has_rerender_script)
        tab = page[page.index('id="react-rerender"'):page.index('id="react-memo"')]
        self.assertEqual(tab.count("data-story-svg"), 5, "every story owns exactly one SVG stage")
        for control in ("play", "prev", "next", "replay"):
            self.assertEqual(tab.count(f'data-walk-control="{control}"'), 5)
        self.assertEqual(tab.count("data-walk-cap"), 5)
        self.assertEqual(tab.count("data-walk-term"), 5)
        self.assertNotIn("data-walk-visual", tab, "the rerender stories run on rerender-visual.js, not walk-visual.js")
        self.assertNotIn("data-react-layer", tab, "the rerender tab must not leak into the Virtual DOM scene contract")
        self.assertNotIn("<pre", tab, "the rerender tab stays free of code blocks")
        for word in ("memo", "useCallback", "useMemo", "children", "useContext", "useSyncExternalStore", "startTransition", "useDeferredValue", "Profiler", "React Compiler"):
            self.assertIn(word, tab)
        self.assertIn("rerender-visual.js", parser.script_sources)
        self.assertIn("Virtual DOM, ререндер", page)
        for selector in (".rerender-traps__list", ".walk-scene .is-called", ".walk-scene .is-skipped", ".wk-card rect", ".wk-bar--tr rect", ".wk-lane"):
            self.assertIn(selector, styles)

    def test_memo_tab_is_three_tool_stories_a_fact_grid_and_a_script(self):
        """Catches the memoization tab losing a tool, its facts, or drifting into prose."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)
        styles = STYLES_FILE.read_text(encoding="utf-8")

        self.assertEqual(parser.tab_order[-17:], ["#react-rerender", "#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"])
        tools = ["memo", "usecallback", "usememo"]
        self.assertEqual(parser.memo_layers, tools + ["facts", "script"])
        self.assertEqual(parser.memo_definitions, tools)
        self.assertEqual(parser.memo_say, tools)
        self.assertEqual(parser.memo_facts, tools)
        self.assertEqual(parser.stories[parser.stories.index("cost"):][5:8], ["tool-memo", "tool-callback", "tool-usememo"])
        self.assertTrue(parser.has_memo_script)
        tab = page[page.index('id="react-memo"'):page.index('id="react-hooks"')]
        self.assertEqual(tab.count("data-story-svg"), 3, "one SVG stage per tool")
        for control in ("play", "prev", "next", "replay"):
            self.assertEqual(tab.count(f'data-walk-control="{control}"'), 3)
        self.assertEqual(tab.count("<b>Решает</b>"), 3)
        self.assertEqual(tab.count("<b>Цена</b>"), 3)
        self.assertEqual(tab.count("<b>Не надо</b>"), 3)
        self.assertNotIn("<pre", tab, "the memo tab stays free of code blocks")
        self.assertNotIn("data-rerender-layer", tab)
        for word in ("Object.is", "Profiler", "React Compiler", "deps", "по ссылке"):
            self.assertIn(word, tab)
        self.assertIn("мемоизация, хуки", page)
        for selector in (".memo-facts__grid", ".memo-facts__card b", ".memo-facts__note"):
            self.assertIn(selector, styles)

    def test_hooks_tab_is_five_stories_a_guide_and_a_script(self):
        """Catches the hooks tab losing a story, its guide, or drifting into prose."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)
        styles = STYLES_FILE.read_text(encoding="utf-8")

        self.assertEqual(parser.tab_order[-16:], ["#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"])
        scenes = ["timing", "stale", "race", "ref", "custom"]
        self.assertEqual(parser.hooktab_layers, scenes + ["guide", "script"])
        self.assertEqual(parser.hooktab_definitions, scenes)
        self.assertEqual(parser.hooktab_say, scenes)
        self.assertEqual(parser.hooktab_guide, ["state", "ref", "effect", "layout", "memo", "store", "transition"])
        self.assertEqual(parser.stories[parser.stories.index("cost"):][8:13], ["hook-timing", "hook-stale", "hook-race", "hook-ref", "hook-custom"])
        self.assertTrue(parser.has_hooktab_script)
        tab = page[page.index('id="react-hooks"'):page.index('id="react-patterns"')]
        self.assertEqual(tab.count("data-story-svg"), 5, "one SVG stage per hook question")
        for control in ("play", "prev", "next", "replay"):
            self.assertEqual(tab.count(f'data-walk-control="{control}"'), 5)
        self.assertNotIn("<pre", tab, "the hooks tab stays free of code blocks")
        self.assertNotIn("data-hooks-", tab, "the old SMIL hooks contract must not come back")
        for word in ("useLayoutEffect", "stale", "AbortController", "cleanup", "useRef", "current", "exhaustive-deps", "useToggle"):
            self.assertIn(word, tab)
        self.assertIn("мемоизация, хуки", page)
        self.assertIn(".hooks-guide__list b", styles)

    def test_patterns_tab_is_five_stories_a_guide_and_a_script(self):
        """Catches the component-patterns tab losing a story, its guide, or drifting into prose."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)
        styles = STYLES_FILE.read_text(encoding="utf-8")

        self.assertEqual(parser.tab_order[-15:], ["#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"])
        scenes = ["compose", "compound", "controlled", "headless", "ds"]
        self.assertEqual(parser.patterns_layers, scenes + ["guide", "script"])
        self.assertEqual(parser.patterns_definitions, scenes)
        self.assertEqual(parser.patterns_say, scenes)
        self.assertEqual(parser.patterns_guide, ["children", "compound", "controlled", "hook", "headless", "ds"])
        self.assertEqual(parser.stories[parser.stories.index("cost"):][13:18], ["pattern-compose", "pattern-compound", "pattern-controlled", "pattern-headless", "pattern-ds"])
        self.assertTrue(parser.has_patterns_script)
        tab = page[page.index('id="react-patterns"'):page.index('id="react-state"')]
        self.assertEqual(tab.count("data-story-svg"), 5, "one SVG stage per pattern question")
        for control in ("play", "prev", "next", "replay"):
            self.assertEqual(tab.count(f'data-walk-control="{control}"'), 5)
        self.assertNotIn("<pre", tab, "the patterns tab stays free of code blocks")
        for word in ("children", "Tabs.Panel", "useContext", "defaultValue", "onChange", "withData", "useMouse", "Radix", "Storybook", "play", "Chromatic", "asChild"):
            self.assertIn(word, tab)
        self.assertIn("хуки, паттерны компонентов", page)
        self.assertIn(".wk-edge--ctx", styles)

    def test_state_tab_is_five_short_stories_a_guide_and_a_twenty_second_answer(self):
        """Catches the state-and-data tab losing a story, growing back into prose, or losing its guide."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        self.assertEqual(parser.tab_order[-14:], ["#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"])
        scenes = ["kinds", "query", "store", "stores", "derived", "stream"]
        self.assertEqual(parser.statetab_layers, scenes + ["guide", "script"])
        self.assertEqual(parser.statetab_definitions, scenes)
        self.assertEqual(parser.statetab_say, scenes)
        self.assertEqual(parser.statetab_guide, ["ui", "client", "server", "url", "derived", "stream"])
        self.assertEqual(parser.stories[parser.stories.index("cost"):][18:23], ["state-kinds", "state-query", "state-store", "state-derived", "state-stream"])
        self.assertTrue(parser.has_statetab_script)
        tab = page[page.index('id="react-state"'):page.index('id="fsd"')]
        self.assertEqual(tab.count("data-story-svg"), 5, "one SVG stage per question; the store comparison is a table, not a scene")
        for store in ("zustand", "rtk", "rtkq", "mobx"):
            self.assertIn(f'data-store-row="{store}"', tab)
            self.assertIn(f'data-store-card="{store}"', tab)
        for word in ("createSlice", "createApi", "makeAutoObservable", "invalidatesTags", "observer"):
            self.assertIn(word, tab)
        for control in ("play", "prev", "next", "replay"):
            self.assertEqual(tab.count(f'data-walk-control="{control}"'), 5)
        self.assertNotIn("<pre", tab, "the state tab stays free of code blocks")
        self.assertIn("Ответ за 20 секунд", tab, "the compact format: a twenty-second answer instead of a minute-long story")
        for word in ("useQuery", "invalidateQueries", "useSyncExternalStore", "Zustand", "Redux Toolkit", "useMemo", "ReadableStream", "AbortController", "searchParams"):
            self.assertIn(word, tab)
        self.assertIn("паттерны компонентов, состояние и AI-интеграции уже разобраны", page)

    def test_csp_tab_sits_after_csrf_with_one_flow_directives_and_a_short_answer(self):
        """Catches CSP losing its place next to CSRF, its animated flow, or growing back into prose."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        csrf_index = parser.tab_order.index("#csrf")
        self.assertEqual(parser.tab_order[csrf_index:csrf_index + 3], ["#csrf", "#csp", "#http-versions"])
        self.assertEqual(parser.tab_panel_order[csrf_index:csrf_index + 3], ["csrf", "csp", "http-versions"])
        self.assertEqual(parser.csp_layers, ["short-answer", "flow", "directives", "vs-csrf", "interview-answer"])
        self.assertEqual(parser.csp_directives, ["default-src", "script-src", "connect-src", "assets", "frame-ancestors", "hardening", "report", "spa"])
        self.assertEqual(parser.csp_compare, ["csrf", "csp"])
        self.assertTrue(parser.has_csp_interview_answer)
        self.assertEqual(parser.stories[0], "csp-flow", "the CSP flow runs on the shared story runner")
        tab = page[page.index('id="csp"'):page.index('id="http-versions"')]
        self.assertEqual(tab.count("data-story-svg"), 1)
        for control in ("play", "prev", "next", "replay"):
            self.assertEqual(tab.count(f'data-walk-control="{control}"'), 1)
        self.assertNotIn("<pre", tab, "the CSP tab stays free of code blocks")
        self.assertIn("Ответ за 20 секунд", tab)
        for word in ("Content-Security-Policy", "nonce", "strict-dynamic", "connect-src", "frame-ancestors", "Report-Only", "report-to", "XSS", "unsafe-inline"):
            self.assertIn(word, tab)

    def test_cors_short_answer_starts_with_the_proxy_bypass_note(self):
        """Catches the plain-words proxy note dropping out of the top of the CORS tab."""
        page = INDEX_FILE.read_text(encoding="utf-8")
        cors_tab = page[page.index('id="cors"'):page.index('id="csrf"')]
        short_answer = cors_tab[cors_tab.index('data-cors-layer="short-answer"'):cors_tab.index('data-cors-layer="mental-model"')]

        self.assertIn("data-cors-proxy-note", short_answer, "the proxy bypass note lives in the opening block")
        self.assertIn("proxy", short_answer)
        self.assertIn("CORS есть только в браузере", short_answer)
        self.assertIn('<strong class="security-lead__shout">Обойти можно через proxy</strong>', short_answer, "the bypass phrase is shouted")
        styles = STYLES_FILE.read_text(encoding="utf-8")
        self.assertIn(".security-lead__note", styles)
        shout = styles[styles.index(".security-lead__shout {"):]
        self.assertIn("text-transform: uppercase", shout[:shout.index("}")])

    def test_this_tab_follows_closures_with_four_short_stories(self):
        """Catches the this tab drifting out of the JavaScript sequence, losing a story, or growing into prose."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        closures_index = parser.tab_order.index("#closures")
        self.assertEqual(parser.tab_order[closures_index:closures_index + 4], ["#closures", "#this-keyword", "#prototypes", "#react-rendering"])
        scenes = ["rule", "lost", "arrow", "class"]
        self.assertEqual(parser.thistab_layers, scenes + ["guide", "script"])
        self.assertEqual(parser.thistab_say, scenes)
        self.assertEqual(parser.thistab_guide, ["dot", "plain", "new", "explicit", "arrow", "dom"])
        self.assertTrue(parser.has_thistab_script)
        tab = page[page.index('id="this-keyword"'):page.index('id="prototypes"')]
        self.assertEqual(tab.count("data-story-svg"), 4)
        self.assertEqual(tab.count('data-walk-control="play"'), 4)
        self.assertNotIn("<pre", tab)
        self.assertIn("Ответ за 20 секунд", tab)
        for word in ("call", "apply", "bind", "strict", "setTimeout", "onClick", "стрелк"):
            self.assertIn(word, tab)
        self.assertIn("this и прототипы", page)

    def test_prototypes_tab_follows_this_with_four_short_stories(self):
        """Catches the prototypes tab losing the chain, the new steps, or the shared-methods story."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        scenes = ["link", "chain", "create", "shared", "inherit"]
        self.assertEqual(parser.prototab_layers, scenes + ["guide", "script"])
        self.assertEqual(parser.prototab_say, scenes)
        self.assertEqual(parser.prototab_guide, ["link", "prop", "new", "class", "shadow", "instanceof"])
        self.assertTrue(parser.has_prototab_script)
        tab = page[page.index('id="prototypes"'):page.index('id="react-rendering"')]
        self.assertEqual(tab.count("data-story-svg"), 5)
        self.assertEqual(tab.count('data-walk-control="play"'), 5)
        self.assertNotIn("<pre", tab)
        self.assertLess(tab.index('data-story="proto-link"'), tab.index('data-story="proto-chain"'), "the __proto__ vs prototype scene opens the tab")
        for word in ("__proto__ = { swim() {} }", "Dog.prototype.run", "Object.setPrototypeOf", "[[Prototype]]", "Object.prototype", "Object.create", "hasOwnProperty", "instanceof", "super", "__proto__"):
            self.assertIn(word, tab)
        stories = parser.stories[parser.stories.index("this-rule"):parser.stories.index("cost")]
        self.assertEqual(stories, ["this-rule", "this-lost", "this-arrow", "this-class", "proto-link", "proto-chain", "proto-create", "proto-shared", "proto-inherit"])

    def test_typescript_group_is_one_tab_per_topic_after_react(self):
        """Catches the TypeScript group leaving its place after React, or topics collapsing back into one tab."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        self.assertIn(("p", "typescript", True), parser.nav_groups)
        self.assertEqual(parser.tab_order[-12:], ["#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"], "TypeScript comes after the React block")
        self.assertEqual(parser.tab_panel_order[-12:], ["fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"])
        scenes = ["type-interface", "problems", "generics", "generic-limits", "unknown-never", "narrowing", "util-objects", "util-unions", "util-functions", "util-async", "util-const"]
        self.assertEqual(parser.tstab_layers, scenes)
        self.assertEqual(parser.tstab_say, scenes)
        self.assertEqual(parser.tstab_guide, [], "the summary tab was removed on request")
        self.assertFalse(parser.has_tstab_script)
        self.assertNotIn('id="ts-boundaries"', page)
        self.assertNotIn('id="ts-summary"', page)
        utility_tab = page[page.index('id="ts-utility"'):page.index('id="ai-llm"')]
        self.assertEqual(utility_tab.count("data-story-svg"), 5, "utility types are scenes, not a list")
        for name in ("Partial", "Required", "Readonly", "Pick", "Omit", "Record", "Exclude", "Extract", "NonNullable", "Parameters", "ReturnType", "ConstructorParameters", "InstanceType", "ThisParameterType", "OmitThisParameter", "ThisType", "Awaited", "NoInfer", "Uppercase", "Lowercase", "Capitalize", "Uncapitalize", "as const", "satisfies"):
            self.assertIn(name, utility_tab)
        tab = page[page.index('id="ts-types"'):page.index('id="ai-llm"')]
        self.assertEqual(tab.count("data-story-svg"), 11)
        self.assertEqual(tab.count('data-walk-control="play"'), 11)
        per_tab = {"ts-types": 2, "ts-generics": 2, "ts-unknown-never": 1, "ts-narrowing": 1, "ts-utility": 5}
        bounds = ["ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm"]
        for start, end in zip(bounds, bounds[1:]):
            chunk = page[page.index(f'id="{start}"'):page.index(f'id="{end}"')]
            self.assertEqual(chunk.count("data-story-svg"), per_tab[start], f"{start}: one tab per topic")
        self.assertNotIn("<pre", tab)
        for word in ("declaration merging", "declare module", "implements", "extends", "keyof", "status", "Partial", "Только interface", "Только type", "interface решает", "type решает", "first&lt;T&gt;", "T extends { id: string }", "K extends keyof T", "Props&lt;T&gt;", "unknown", "never", "x is User", "as const", "satisfies"):
            self.assertIn(word, tab)
        self.assertEqual(parser.stories[parser.stories.index("ts-type-interface"):parser.stories.index("ai-request")], ["ts-type-interface", "ts-problems", "ts-generics", "ts-generic-limits", "ts-unknown-never", "ts-narrowing", "ts-util-objects", "ts-util-unions", "ts-util-functions", "ts-util-async", "ts-util-const"])
        self.assertIn("this и прототипы, TypeScript", page)

    def test_story_scenes_have_no_overlapping_boxes(self):
        """Catches a scene layout where a box drifts onto another one (a note strip over a column, a card into a box)."""
        import re

        page = INDEX_FILE.read_text(encoding="utf-8")
        allowed_inside = {"hl"}  # the code-line highlight sits inside the code box on purpose
        allowed_pairs = {("axis-r", "seg-render-r"), ("axis-r", "seg-commit-r"), ("axis-r", "seg-layout-r"), ("axis-r", "seg-paint-r"), ("axis-r", "seg-passive-r")}
        problems = []
        for story, height, body in re.findall(r'<figure class="walk-scene" data-story="([^"]+)".*?viewBox="0 0 900 (\d+)"(.*?)</svg>', page, re.S):
            rects = [
                (m.group(1), float(m.group(2)), float(m.group(3)), float(m.group(4)), float(m.group(5)))
                for m in re.finditer(r'<rect data-wk="([^"]+)"(?: class="[^"]*")? x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"', body)
                if m.group(1) not in allowed_inside
            ]
            for name, x, y, w, h in rects:
                if y + h > float(height) or x + w > 900:
                    problems.append((story, name, "outside the viewBox"))
            for i, a in enumerate(rects):
                for b in rects[i + 1:]:
                    if (a[0], b[0]) in allowed_pairs or (b[0], a[0]) in allowed_pairs:
                        continue
                    if a[1] < b[1] + b[3] and b[1] < a[1] + a[3] and a[2] < b[2] + b[4] and b[2] < a[2] + a[4]:
                        problems.append((story, a[0], b[0]))
        self.assertEqual(problems, [])

    def test_ai_group_is_one_tab_per_topic_after_typescript(self):
        """Catches the AI group leaving its place after TypeScript, losing a topic, or collapsing into one tab."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        self.assertIn(("p", "ai", True), parser.nav_groups)
        self.assertEqual(parser.tab_order[-7:], ["#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"])
        self.assertEqual(parser.tab_panel_order[-7:], ["ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"])
        scenes = ["request", "stream", "embed", "rag", "prompt", "eval"]
        self.assertEqual(parser.aitab_layers, scenes)
        self.assertEqual(parser.aitab_say, scenes)
        self.assertEqual(parser.stories[parser.stories.index("ai-request"):], ["ai-request", "ai-stream", "ai-embed", "ai-rag", "ai-prompt", "ai-eval"])
        per_tab = {"ai-llm": 2, "ai-embeddings": 1, "ai-rag": 1, "ai-prompts": 1, "ai-quality": 1}
        bounds = ["ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"]
        for start, end in zip(bounds, bounds[1:]):
            chunk = page[page.index(f'id="{start}"'):page.index(f'id="{end}"')]
            self.assertEqual(chunk.count("data-story-svg"), per_tab[start], f"{start}: one tab per topic")
            self.assertNotIn("<pre", chunk)
        ai = page[page.index('id="ai-llm"'):page.index('id="roadmap"')]
        for word in ("system", "temperature", "max_tokens", "stream", "AbortController", "[DONE]", "embedding", "cosine", "Векторная база", "Top-k", "RAG", "Zod", "safeParse", "golden", "guardrails", "usage", "finish_reason"):
            self.assertIn(word, ai)
        self.assertIn("feature flags и A/B", page)

    def test_fsd_tab_shows_layers_problems_and_one_example(self):
        """Catches the FSD tab losing a layer, the import rule, or the worked example."""
        parser = PageParser()
        page = INDEX_FILE.read_text(encoding="utf-8")
        parser.feed(page)

        self.assertIn(("p", "architecture", True), parser.nav_groups, "FSD lives in its own group, not under React")
        i = parser.tab_order.index("#fsd")
        self.assertEqual(parser.tab_order[i - 1:i + 2], ["#react-state", "#fsd", "#ts-types"])
        tab = page[page.index('id="fsd"'):page.index('id="ts-types"')]
        for layer in ("app", "pages", "widgets", "features", "entities", "shared"):
            self.assertIn(f">{layer}<", tab, f"the {layer} layer is on the diagram")
        for block in ("layers", "problems", "example"):
            self.assertIn(f'data-fsd-layer="{block}"', tab)
        self.assertEqual(tab.count("data-fsd-problem="), 5, "five problems, each with the FSD answer")
        self.assertEqual(tab.count("data-story-svg"), 0, "the FSD diagrams are static, not story scenes")
        self.assertEqual(tab.count("cy-svg"), 2, "two diagrams: the layers and the worked example")
        for word in ("index.ts", "Steiger", "add-to-cart", "entities/product", "только вниз"):
            self.assertIn(word, tab)
        self.assertIn("в v2.1 начинать с него не советуют", tab, "widgets carry the v2.1 caveat")
        self.assertIn(".fsd-limits", STYLES_FILE.read_text(encoding="utf-8"))

    def test_react_key_demo_ships_its_script_and_compares_both_key_strategies(self):
        """Catches the live key demo losing a board, its script, or its animation styles."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))
        styles = STYLES_FILE.read_text(encoding="utf-8")
        page = INDEX_FILE.read_text(encoding="utf-8")

        self.assertEqual(parser.key_demo_lists, ["index", "id"])
        self.assertIn("key-demo.js", parser.script_sources)
        self.assertTrue((PROJECT_ROOT / "key-demo.js").is_file())
        self.assertIn("data-key-demo-prepend", page)
        self.assertIn("data-key-demo-reset", page)
        for selector in (
            ".react-scene",
            ".react-say",
            ".react-pipe__token",
            ".react-pipe__detail",
            ".react-tree__node",
            ".vdom-scene__ghost",
            ".fiber-scene__pointer",
            ".order-scene__cursor",
            "@keyframes order-cursor",
            "@keyframes order-card-1",
            "@keyframes order-card-7",
            "@keyframes vdom-ghost",
            "@keyframes fiber-pointer",
            "@keyframes pipe-detail",
            "@keyframes react-token-run",
            ".key-demo__boards",
        ):
            self.assertIn(selector, styles)
        self.assertIn("prefers-reduced-motion: no-preference", styles)

    def test_closures_tab_is_three_terms_and_one_reachability_diagram(self):
        """Catches the tab regaining removed blocks or losing a reference chain and its verdict."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))
        page = INDEX_FILE.read_text(encoding="utf-8")
        styles = STYLES_FILE.read_text(encoding="utf-8")

        self.assertEqual(parser.closure_layers, ["short-answer", "solves", "gc-chain"])
        self.assertEqual(
            parser.closure_solves,
            ["private", "memory", "preset", "snapshot", "hooks", "stale"],
        )
        self.assertEqual(parser.gc_chains, ["alive", "freed", "leak"])
        self.assertEqual(parser.gc_verdicts, ["keep", "free", "leak"])
        self.assertEqual(parser.gc_cuts, 1)
        for term in ("Область видимости", "Лексическое окружение", "[[Environment]]", "Сборщик мусора", "removeEventListener"):
            self.assertIn(term, page)
        self.assertNotIn("closures-visual.js", parser.script_sources)
        self.assertFalse((PROJECT_ROOT / "closures-visual.js").exists())
        for selector in (".gc-chain__nodes", ".gc-chain__arrow--cut", ".gc-chain__node.is-unreachable", ".gc-chain__node--target", ".closures-solves__grid"):
            self.assertIn(selector, styles)

    def test_promise_async_tab_follows_event_loop_and_precedes_roadmap(self):
        """Catches the Promise topic being detached from the JavaScript learning sequence."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.tab_order[-24:],
            ["#event-loop-node", "#promise-async-await", "#var-let-const", "#closures", "#this-keyword", "#prototypes", "#react-rendering", "#react-rerender", "#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"],
        )
        self.assertEqual(
            parser.tab_panel_order[-24:],
            ["event-loop-node", "promise-async-await", "var-let-const", "closures", "this-keyword", "prototypes", "react-rendering", "react-rerender", "react-memo", "react-hooks", "react-patterns", "react-state", "fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"],
        )

    def test_promise_is_a_container_with_three_states_and_one_visual_flow(self):
        """Catches the mental model losing its future-result container or lifecycle branches."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.promise_layers,
            [
                "short-answer",
                "states-flow",
                "handlers",
                "async-await",
                "execution",
                "combinators",
                "pitfalls",
                "interview-answer",
            ],
        )
        self.assertEqual(
            parser.promise_definitions,
            {"future-result-or-error-container"},
        )
        self.assertEqual(parser.promise_states, ["pending", "fulfilled", "rejected"])
        self.assertEqual(parser.promise_diagram_count, 1)
        self.assertEqual(parser.promise_animations, {"lifecycle"})
        self.assertEqual(
            parser.promise_flow_steps,
            ["operation", "pending", "settle", "microtask", "result"],
        )
        self.assertEqual(parser.promise_flow_branches, {"fulfilled", "rejected"})

    def test_promise_handlers_and_async_await_explain_success_error_and_resume(self):
        """Catches await being presented as thread blocking or Promise handlers as interchangeable."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.promise_handlers,
            [("then", "success"), ("catch", "error"), ("finally", "always")],
        )
        self.assertEqual(
            parser.promise_async_await_concepts,
            {
                "async-returns-promise",
                "await-pauses-function",
                "thread-not-blocked",
                "resume-as-microtask",
                "try-catch-rejection",
            },
        )

    def test_promise_tab_compares_execution_modes_and_all_four_combinators(self):
        """Catches independent work being serialized or Promise combinators losing their contracts."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.promise_execution_modes,
            {
                ("sequential", "one-after-another"),
                ("parallel", "start-together"),
            },
        )
        self.assertEqual(
            parser.promise_combinators,
            {
                ("all", "all-values-or-first-rejection"),
                ("all-settled", "all-results"),
                ("race", "first-settled"),
                ("any", "first-fulfilled"),
            },
        )

    def test_promise_tab_keeps_pitfalls_visible_and_ends_with_interview_answer(self):
        """Catches the quick-reference warnings or rehearsable answer disappearing."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.promise_pitfalls,
            {
                "promise-not-worker",
                "executor-is-sync",
                "missing-await",
                "combinators-do-not-cancel",
            },
        )
        self.assertTrue(parser.has_promise_interview_answer)

    def test_var_let_const_tab_follows_promises_and_precedes_roadmap(self):
        """Catches the variable topic being merged into another JavaScript tab or misplaced."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.tab_order[-23:],
            ["#promise-async-await", "#var-let-const", "#closures", "#this-keyword", "#prototypes", "#react-rendering", "#react-rerender", "#react-memo", "#react-hooks", "#react-patterns", "#react-state", "#fsd", "#ts-types", "#ts-generics", "#ts-unknown-never", "#ts-narrowing", "#ts-utility", "#ai-llm", "#ai-embeddings", "#ai-rag", "#ai-prompts", "#ai-quality", "#roadmap"],
        )
        self.assertEqual(
            parser.tab_panel_order[-23:],
            ["promise-async-await", "var-let-const", "closures", "this-keyword", "prototypes", "react-rendering", "react-rerender", "react-memo", "react-hooks", "react-patterns", "react-state", "fsd", "ts-types", "ts-generics", "ts-unknown-never", "ts-narrowing", "ts-utility", "ai-llm", "ai-embeddings", "ai-rag", "ai-prompts", "ai-quality", "roadmap"],
        )
        self.assertEqual(
            parser.variable_layers,
            [
                "short-answer",
                "cards",
                "scope-diagram",
                "quick-decision",
                "errors",
                "interview-answer",
            ],
        )

    def test_var_let_const_cards_compare_their_core_rules(self):
        """Catches the three declarations losing a scope, assignment, or hoisting distinction."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.variable_cards,
            [
                (
                    "var",
                    "function-not-block",
                    "yes",
                    "yes-same-scope",
                    "undefined",
                    "optional",
                ),
                (
                    "let",
                    "block",
                    "yes",
                    "no-same-scope",
                    "tdz-reference-error",
                    "optional",
                ),
                (
                    "const",
                    "block",
                    "no",
                    "no-same-scope",
                    "tdz-reference-error",
                    "required",
                ),
            ],
        )

    def test_var_let_const_uses_one_rooms_diagram_and_a_quick_choice(self):
        """Catches the child-friendly scope picture or practical declaration rule disappearing."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.variable_diagram_count, 1)
        self.assertEqual(parser.variable_animations, {"scope-escape"})
        self.assertEqual(parser.variable_rooms, ["function", "block"])
        self.assertEqual(
            parser.variable_boxes,
            {("var", "yes"), ("let", "no"), ("const", "no")},
        )
        self.assertEqual(
            parser.variable_decisions,
            {
                ("default", "const"),
                ("need-reassignment", "let"),
                ("modern-code", "avoid-var"),
            },
        )

    def test_var_let_const_shows_common_errors_and_ends_with_interview_answer(self):
        """Catches important interview traps being hidden below the quick-reference path."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(
            parser.variable_errors,
            {
                ("tdz-before-declaration", "reference-error"),
                ("let-const-redeclaration", "syntax-error"),
                ("const-reassignment", "type-error"),
                ("const-without-initializer", "syntax-error"),
            },
        )
        self.assertEqual(
            parser.variable_pitfalls,
            {"const-object-mutable", "var-loop-shared", "classic-script-global"},
        )
        self.assertTrue(parser.has_variable_interview_answer)

    def test_browser_technical_caveats_stay_closed_by_default(self):
        """Catches the browser caveats leaking into the quick path or Node details returning."""
        parser = PageParser()
        parser.feed(INDEX_FILE.read_text(encoding="utf-8"))

        self.assertEqual(parser.browser_loop_details, [("details", False)])
        self.assertEqual(parser.browser_loop_details_controls, [("summary", "details")])
        self.assertEqual(
            parser.browser_loop_detail_topics,
            ["task-sources", "microtask-starvation", "render-scheduling", "worker-boundary"],
        )
        self.assertEqual(parser.node_loop_details, [])
        self.assertEqual(parser.node_loop_details_controls, [])
        self.assertEqual(parser.node_loop_detail_topics, [])


if __name__ == "__main__":
    unittest.main()
