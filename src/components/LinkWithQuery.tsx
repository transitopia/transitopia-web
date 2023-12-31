import { Link, type LinkProps, useSearch, useRoute } from "wouter";

/**
 * Like wouter's <Link> component, but preserves the query string so that we
 * keep the map state (zoom, lat, long) in the query string when changing URLs.
 */
export function LinkWithQuery(props: LinkProps & {className?: string, classNameActive?: string}) {
    const queryString = useSearch();
    const [isActive] = useRoute(props.href ?? "--");
    if (isActive) {
        props = {...props, className: (props.className ?? "") + " " + props.classNameActive};
    }

    if (props.href?.includes("?")) {
        return <>Links with ? not yet implemented.</>;
    } else if (props.href) {
        const {href, ...otherProps} = props;
        const newHref = href + "?" + queryString;
        return <Link {...otherProps} href={newHref} />;
    } else {
        return <Link {...props}/>
    }
}
